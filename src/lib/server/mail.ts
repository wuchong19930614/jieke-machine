// 发信（技术方案 7.1）：通过 Resend 接口发送；本地没有配置密钥时只打印到控制台
import { maskEmail } from './logSafe'

export type MailMessage = {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
  fromName?: string
}

export type MailResult = { ok: true; id?: string } | { ok: false; error: string; notConfigured?: boolean }

const TIMEOUT_MS = 5000

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM
  if (!apiKey || !from) {
    // 正文可能含客户资料或密码重置链接，生产环境只记打码后的收件人和主题
    const production = process.env.NODE_ENV === 'production'
    const body = production ? '' : `\n${message.text}`
    console.info(`[邮件未发送：未配置 RESEND_API_KEY / MAIL_FROM] 收件人 ${production ? maskEmail(message.to) : message.to}，主题：${message.subject}${body}`)
    // 按失败处理：询盘里显示“失败”和原因，配置好后由定时任务或“重新发送”补发，不能记成已发送
    return { ok: false, error: '没有配置发信服务（RESEND_API_KEY / MAIL_FROM），邮件没有发出', notConfigured: true }
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const sender = message.fromName && !from.includes('<') ? `${message.fromName} <${from}>` : from
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: sender,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string }
    if (!res.ok) return { ok: false, error: explainResendError(res.status, data.name, data.message) }
    return { ok: true, id: data.id }
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError'
    return { ok: false, error: aborted ? '发送超时（5 秒）' : String(error).slice(0, 300) }
  } finally {
    clearTimeout(timer)
  }
}

// Resend 的报错是英文，询盘详情和“重新发送”按钮直接显示给业务人员：常见原因换成中文说明，后面附原文方便排查
export function explainResendError(status: number, name?: string, message?: string): string {
  const raw = `${status} ${name ?? ''} ${message ?? ''}`.trim()
  const text = `${name ?? ''} ${message ?? ''}`.toLowerCase()
  let hint = ''
  if (status === 401 || text.includes('api_key') || text.includes('api key')) hint = '发信密钥无效，请检查 Vercel 环境变量 RESEND_API_KEY'
  else if (text.includes('testing emails') || text.includes('verify a domain') || text.includes('not verified')) hint = '发信域名还没在 Resend 完成认证，现在只能发给 Resend 账号本人'
  else if (status === 429) hint = '超过 Resend 发送额度（免费版每天 100 封），系统会稍后自动重试'
  else if (status === 422 || status === 400) hint = '发件地址或收件地址不正确，请检查 MAIL_FROM 和收件邮箱'
  else if (status >= 500) hint = 'Resend 服务暂时出错，系统会稍后自动重试'
  return (hint ? `${hint}（原始信息：${raw}）` : `发信失败（原始信息：${raw}）`).slice(0, 300)
}

export const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
