// 询盘邮件（技术方案 5.5、6.1、7.1）：内部通知（中文，含全部字段和后台链接）与客户自动回复
import type { Payload } from 'payload'

import { countryName } from '@/lib/countries'
import { getSettingsUncached } from '@/lib/server/settings'
import { INQUIRY_SOURCES, MAX_NOTIFY_ATTEMPTS } from '@/lib/constants'
import { siteUrl } from '@/lib/previewPath'
import type { Inquiry } from '@/payload-types'

import { escapeHtml, type MailMessage, sendMail } from './mail'

export type MailTarget = 'notify' | 'autoReply'

const sourceLabel = (value: string) => INQUIRY_SOURCES.find((s) => s.value === value)?.label ?? value

function formatTime(iso: string): string {
  const date = new Date(iso)
  const beijing = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short' }).format(date)
  return `${beijing}（北京时间） / ${date.toISOString().replace('T', ' ').slice(0, 16)} UTC`
}

export function buildNotification(inquiry: Inquiry, notifyEmail: string, options: { dbFailed?: boolean } = {}): MailMessage {
  const flag = options.dbFailed ? '[数据库写入失败，需手工录入] ' : inquiry.spamFlag === 'too_fast' ? '[可疑] ' : ''
  const product = inquiry.productName ? `${inquiry.productName} · ` : ''
  const subject = `${flag}[新询盘] ${product}${inquiry.name}${inquiry.country ? `（${countryName(inquiry.country)}）` : ''}`
  const utm = [inquiry.utmSource, inquiry.utmMedium, inquiry.utmCampaign, inquiry.utmTerm, inquiry.utmContent].filter(Boolean).join(' / ')
  const adminLink = inquiry.id ? `${siteUrl()}/admin/collections/inquiries/${inquiry.id}` : ''
  const rows: [string, string | null | undefined][] = [
    ['询盘编号', inquiry.inquiryRef],
    ['来源', sourceLabel(inquiry.source)],
    ['姓名', inquiry.name],
    ['邮箱', inquiry.email],
    ['国家 / 地区', inquiry.country ? `${countryName(inquiry.country)}（${inquiry.country}）` : ''],
    ['电话 / WhatsApp', inquiry.phone],
    ['公司', inquiry.company],
    ['产品', [inquiry.productName, inquiry.productCode].filter(Boolean).join(' · ')],
    ['客户填写的产品 / 型号', inquiry.productModel],
    ['需求', inquiry.requirements],
    ['提交页面', inquiry.pageUrl],
    ['首次进入的落地页', inquiry.landingPage],
    ['来源网站', inquiry.referrer],
    ['广告参数', utm],
    ['提交时间', inquiry.createdAt ? formatTime(inquiry.createdAt) : formatTime(new Date().toISOString())],
    ['后台查看', adminLink],
  ]
  const filled = rows.filter(([, value]) => value)
  const text = [
    options.dbFailed ? '注意：这条询盘没有存进数据库（数据库暂时不可用），请手工记录并尽快联系客户。\n' : '',
    ...filled.map(([label, value]) => `${label}：${value}`),
    '',
    '直接回复本邮件即可联系客户。',
  ].join('\n')
  const html = `<div style="font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;font-size:14px;color:#142b42">
${options.dbFailed ? '<p style="color:#b00020"><strong>注意：这条询盘没有存进数据库（数据库暂时不可用），请手工记录并尽快联系客户。</strong></p>' : ''}
<table cellpadding="8" style="border-collapse:collapse">${filled
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="border-bottom:1px solid #dbe3ea;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</th><td style="border-bottom:1px solid #dbe3ea;white-space:pre-wrap">${
          label === '后台查看' ? `<a href="${escapeHtml(String(value))}">${escapeHtml(String(value))}</a>` : escapeHtml(String(value))
        }</td></tr>`,
    )
    .join('')}</table>
<p>直接回复本邮件即可联系客户。</p></div>`
  return { to: notifyEmail, subject, text, html, replyTo: inquiry.email }
}

// 自动回复：只用姓名和系统里的产品名，不回显客户填写的需求和公司（英文界面文案 17.2）
export function buildAutoReply(
  inquiry: Inquiry,
  texts: { subject: string; body: string },
  company: { companyName: string; email: string; phone: string; whatsapp: string },
): MailMessage | null {
  const hasUrl = /https?:\/\/|www\./i.test(inquiry.name)
  const vars: Record<string, string> = {
    name: hasUrl ? '' : inquiry.name,
    companyName: company.companyName,
    businessEmail: company.email,
    phone: company.phone,
    whatsapp: company.whatsapp,
    websiteUrl: siteUrl(),
    aboutProduct: inquiry.productName ? ` about ${inquiry.productName}` : '',
  }
  // 含变量的行：变量为空时整行不写（{aboutProduct} 为空不影响）
  const renderLine = (line: string): string | null => {
    if (/\{name\}/.test(line) && !vars.name) return line.replace(/^Hi \{name\},?/, 'Hello,').replace(/\{name\}/g, '')
    let drop = false
    const out = line.replace(/\{(\w+)\}/g, (_, key: string) => {
      const value = vars[key]
      if (key !== 'aboutProduct' && !value) drop = true
      return value ?? ''
    })
    // 公司名以句点结尾（如 Co., Ltd.）时，与模板里的句点合并
    return drop ? null : out.replace(/(?<!\.)\.\.(?!\.)/g, '.')
  }
  const subject = renderLine(texts.subject) ?? `We've received your inquiry`
  const lines = texts.body.split('\n').map(renderLine).filter((l): l is string => l !== null)
  const text = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!text) return null
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#142b42">${text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')}</div>`
  return { to: inquiry.email, subject, text, html, replyTo: company.email || undefined, fromName: company.companyName || undefined }
}

type Delivery = { ok: boolean; status: 'sent' | 'failed'; attempts: number; error: string | null; gaveUp: boolean }

// 发送询盘邮件并更新发送状态（6.2 节重发接口和定时任务共用）
// 多封邮件并行发送，状态合并成一次更新写回：分开更新同一条询盘时，后写的会把先写的状态覆盖掉
export async function deliverInquiryMails(payload: Payload, inquiry: Inquiry, targets: MailTarget[]): Promise<Partial<Record<MailTarget, Delivery>>> {
  if (!targets.length) return {}
  const settings = await getSettingsUncached(payload)
  const data: Record<string, unknown> = {}
  const deliveries: Partial<Record<MailTarget, Delivery>> = {}
  await Promise.all(
    targets.map(async (target) => {
      const attemptsKey = target === 'notify' ? 'notifyAttempts' : 'autoReplyAttempts'
      const statusKey = target === 'notify' ? 'notifyStatus' : 'autoReplyStatus'
      const errorKey = target === 'notify' ? 'notifyError' : 'autoReplyError'
      const attempts = (inquiry[attemptsKey] ?? 0) + 1
      const message =
        target === 'notify'
          ? settings.notifyEmail
            ? buildNotification(inquiry, settings.notifyEmail)
            : null
          : buildAutoReply(inquiry, settings.autoReply, settings)
      const result = message ? await sendMail(message) : { ok: false as const, error: target === 'notify' ? '全站设置里没有填写询盘通知邮箱' : '自动回复内容为空' }
      const status = result.ok ? 'sent' : 'failed'
      const error = result.ok ? null : result.error
      Object.assign(data, { [statusKey]: status, [attemptsKey]: attempts, [errorKey]: error })
      deliveries[target] = { ok: result.ok, status, attempts, error, gaveUp: !result.ok && attempts >= MAX_NOTIFY_ATTEMPTS }
    }),
  )
  await payload.update({ collection: 'inquiries', id: inquiry.id, data, overrideAccess: true, context: { disableRevalidate: true } })
  return deliveries
}

export async function deliverInquiryMail(payload: Payload, inquiry: Inquiry, target: MailTarget): Promise<Delivery> {
  return (await deliverInquiryMails(payload, inquiry, [target]))[target]!
}
