// POST /api/inquiries/{id}/resend：重新发送询盘邮件（技术方案 6.2），需要管理员或业务人员登录并通过双重验证
import { getPayloadClient } from '@/lib/payload'
import { deliverInquiryMail, type MailTarget } from '@/lib/server/inquiryMail'
import { readJson } from '@/lib/server/request'
import { checkStaff } from '@/lib/staffAuth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayloadClient()
  const auth = await checkStaff(payload, request.headers, ['admin', 'sales'])
  if (!auth.ok) return Response.json({ ok: false, code: auth.code }, { status: auth.status })

  const { id } = await params
  const body = (await readJson(request).catch(() => ({}))) as { target?: string }
  const target: MailTarget = body.target === 'autoReply' ? 'autoReply' : 'notify'

  const inquiry = await payload.findByID({ collection: 'inquiries', id, depth: 0, overrideAccess: true, disableErrors: true })
  if (!inquiry) return Response.json({ ok: false, code: 'NOT_FOUND' }, { status: 404 })
  if (target === 'autoReply' && inquiry.spamFlag !== 'none') {
    return Response.json({ ok: false, status: inquiry.autoReplyStatus, attempts: inquiry.autoReplyAttempts ?? 0, error: '可疑询盘不发送客户自动回复' }, { status: 400 })
  }

  const result = await deliverInquiryMail(payload, inquiry, target)
  return Response.json({ ok: result.ok, status: result.status, attempts: result.attempts, error: result.error })
}
