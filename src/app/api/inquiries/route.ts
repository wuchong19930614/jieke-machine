// POST /api/inquiries：提交询盘（技术方案 6.1），四种表单共用，无需登录
import { fill } from '@/content/defineTexts'
import type { SpamFlag } from '@/lib/constants'
import { countLinks, validateInquiry } from '@/lib/inquirySchema'
import { getPayloadClient } from '@/lib/payload'
import { checkFormToken, MIN_FILL_MS } from '@/lib/server/formToken'
import { buildNotification, deliverInquiryMails, type MailTarget } from '@/lib/server/inquiryMail'
import { nextInquiryRef, uniqueConflictField } from '@/lib/server/inquiryRef'
import { sendMail } from '@/lib/server/mail'
import { clientIp, hashIp, readJson } from '@/lib/server/request'
import { getSettingsUncached } from '@/lib/server/settings'
import { verifyTurnstile } from '@/lib/server/turnstile'
import type { Inquiry } from '@/payload-types'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_PER_HOUR = 5
const DEDUPE_MINUTES = 10
const REDIRECT = '/thank-you/'

const str = (value: unknown, max = 500): string => (typeof value === 'string' ? value.trim().slice(0, max) : '')

export async function POST(request: Request) {
  const payload = await getPayloadClient()
  const settings = await getSettingsUncached(payload)
  const t = settings.form
  const withEmail = (template: string) => fill(template, { businessEmail: settings.email }) || template.replace(/,? or email us at \{businessEmail\}\.?/, '.').replace(/\{businessEmail\}/g, '')

  let body: Record<string, unknown>
  try {
    body = (await readJson(request)) as Record<string, unknown>
  } catch {
    return Response.json({ ok: false, code: 'VALIDATION_ERROR', message: t.errorSummary }, { status: 400 })
  }

  // 1. 按共用规则校验字段
  const result = validateInquiry({
    source: body.source,
    name: body.name,
    email: body.email,
    country: body.country,
    phone: body.phone,
    company: body.company,
    productModel: body.productModel,
    requirements: body.requirements,
  })
  if (!result.ok) {
    const fields = Object.fromEntries(Object.entries(result.errors).map(([field, key]) => [field, t[key]]))
    return Response.json({ ok: false, code: 'VALIDATION_ERROR', message: t.errorSummary, fields }, { status: 400 })
  }
  const data = result.data

  // 表单令牌（6.5 节）：无效时按校验失败返回，前台会重新领取
  const token = checkFormToken(body.formToken)
  if (!token.valid) return Response.json({ ok: false, code: 'VALIDATION_ERROR', message: t.captchaFailed }, { status: 400 })

  const ip = clientIp(request.headers)
  if (settings.turnstileEnabled && !(await verifyTurnstile(body.turnstileToken, ip))) {
    return Response.json({ ok: false, code: 'VALIDATION_ERROR', message: t.captchaFailed }, { status: 400 })
  }

  // 2. 防垃圾：命中陷阱字段时返回与成功相同的结果但不保存，不提示机器人
  if (str(body.website)) return Response.json({ ok: true, inquiryRef: '', redirect: REDIRECT }, { status: 201 })

  const ipHash = hashIp(ip)
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const recent = await payload.count({
    collection: 'inquiries',
    where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: hourAgo } }] },
    overrideAccess: true,
  })
  if (recent.totalDocs >= RATE_LIMIT_PER_HOUR) {
    return Response.json({ ok: false, code: 'RATE_LIMITED', message: withEmail(t.errRateLimited) }, { status: 429 })
  }

  // 3. 可疑标记：填写过快、网址过多；都照常保存
  const spamFlag: SpamFlag = countLinks(data.requirements) > 3 ? 'too_many_links' : token.ageMs < MIN_FILL_MS ? 'too_fast' : 'none'

  // 4. 10 分钟内相同的提交编号只保存一次
  const submissionId = str(body.submissionId, 100)
  const findSubmission = async (): Promise<Inquiry | null> =>
    submissionId
      ? ((await payload.find({ collection: 'inquiries', where: { submissionId: { equals: submissionId } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] ?? null)
      : null
  if (submissionId) {
    const doc = await findSubmission()
    if (doc) {
      const fresh = Date.now() - new Date(doc.createdAt).getTime() < DEDUPE_MINUTES * 60 * 1000
      return Response.json({ ok: true, inquiryRef: fresh ? doc.inquiryRef : '', redirect: REDIRECT }, { status: 201 })
    }
  }

  // 产品页表单：名称和编号保存当时的快照
  let product: { id: number; name: string; productCode?: string | null } | null = null
  const productId = Number(body.productId)
  if (data.source === 'product_page' && Number.isInteger(productId) && productId > 0) {
    const found = await payload.find({ collection: 'products', where: { and: [{ id: { equals: productId } }, { _status: { equals: 'published' } }] }, depth: 0, limit: 1, overrideAccess: true })
    if (found.docs[0]) product = found.docs[0]
  }

  const utm = (body.utm && typeof body.utm === 'object' ? body.utm : {}) as Record<string, unknown>
  const inquiryData = {
    source: data.source,
    name: data.name,
    email: data.email,
    // 国家代码已由校验规则确认属于 ISO 列表
    country: data.country as Inquiry['country'],
    phone: data.phone,
    company: data.company,
    productModel: data.productModel,
    requirements: data.requirements,
    product: product?.id,
    productName: product?.name,
    productCode: product?.productCode ?? undefined,
    pageUrl: str(body.pageUrl),
    landingPage: str(body.landingPage),
    referrer: str(body.referrer),
    utmSource: str(utm.source, 200),
    utmMedium: str(utm.medium, 200),
    utmCampaign: str(utm.campaign, 200),
    utmTerm: str(utm.term, 200),
    utmContent: str(utm.content, 200),
    status: spamFlag === 'too_many_links' ? ('invalid' as const) : ('new' as const),
    spamFlag,
    notifyStatus: spamFlag === 'too_many_links' ? ('skipped' as const) : ('pending' as const),
    autoReplyStatus: spamFlag === 'none' ? ('pending' as const) : ('skipped' as const),
    ipHash,
    userAgent: str(request.headers.get('user-agent'), 300),
    submissionId: submissionId || undefined,
  }

  // 5. 写入询盘表；写入失败时把内容直接发到通知邮箱，访客页面按失败处理
  let inquiry: Inquiry | null = null
  for (let attempt = 0; attempt < 4 && !inquiry; attempt++) {
    try {
      const ref = await nextInquiryRef(payload)
      const inquiryRef = attempt === 0 ? ref : `${ref}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
      inquiry = await payload.create({ collection: 'inquiries', data: { ...inquiryData, inquiryRef }, overrideAccess: true, context: { disableRevalidate: true } })
    } catch (error) {
      const conflict = uniqueConflictField(error)
      // 同一提交编号的另一个请求已先保存（重复点击、网络重试），按已保存返回
      if (conflict === 'submissionId') {
        const saved = await findSubmission().catch(() => null)
        if (saved) return Response.json({ ok: true, inquiryRef: saved.inquiryRef, redirect: REDIRECT }, { status: 201 })
      }
      // 同时提交的询盘算出了同一个编号，换一个再试
      if (conflict === 'inquiryRef' && attempt < 3) continue
      payload.logger.error({ err: error, msg: '询盘写入数据库失败，改为直接发邮件' })
      if (settings.notifyEmail) {
        const fallback = { ...inquiryData, id: 0, inquiryRef: '（未保存）', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as unknown as Inquiry
        await sendMail(buildNotification(fallback, settings.notifyEmail, { dbFailed: true })).catch(() => undefined)
      }
      return Response.json({ ok: false, code: 'SERVER_ERROR', message: withEmail(t.errServer) }, { status: 500 })
    }
  }
  if (!inquiry) return Response.json({ ok: false, code: 'SERVER_ERROR', message: withEmail(t.errServer) }, { status: 500 })

  // 6. 发送邮件：各自最多等 5 秒；失败的交给定时任务重发，不影响返回成功
  const targets: MailTarget[] = []
  if (inquiry.notifyStatus === 'pending') targets.push('notify')
  if (inquiry.autoReplyStatus === 'pending') targets.push('autoReply')
  await deliverInquiryMails(payload, inquiry, targets).catch((error) => payload.logger.error({ err: error, msg: '询盘邮件发送状态写入失败' }))

  // 7. 返回成功响应
  return Response.json({ ok: true, inquiryRef: inquiry.inquiryRef, redirect: REDIRECT }, { status: 201 })
}
