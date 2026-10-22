// GET /api/cron/retry-notifications：每 15 分钟重发失败的询盘邮件，达到 10 次后不再自动重发（技术方案 6.4）
// 超过 10 分钟仍是“待发送”的也一起重发（提交请求在写库后被中断时会停在这个状态）
import { MAX_NOTIFY_ATTEMPTS } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { isCronRequest, unauthorized } from '@/lib/server/cron'
import { deliverInquiryMail, type MailTarget } from '@/lib/server/inquiryMail'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STALE_PENDING_MINUTES = 10

export async function GET(request: Request) {
  if (!isCronRequest(request)) return unauthorized()
  const payload = await getPayloadClient()
  let retried = 0
  let succeeded = 0
  let gaveUp = 0
  const targets: { target: MailTarget; status: string; attempts: string }[] = [
    { target: 'notify', status: 'notifyStatus', attempts: 'notifyAttempts' },
    { target: 'autoReply', status: 'autoReplyStatus', attempts: 'autoReplyAttempts' },
  ]
  const stalePending = new Date(Date.now() - STALE_PENDING_MINUTES * 60 * 1000).toISOString()
  for (const { target, status, attempts } of targets) {
    const { docs } = await payload.find({
      collection: 'inquiries',
      where: {
        and: [
          {
            or: [
              { [status]: { equals: 'failed' } },
              { and: [{ [status]: { equals: 'pending' } }, { createdAt: { less_than: stalePending } }] },
            ],
          },
          { [attempts]: { less_than: MAX_NOTIFY_ATTEMPTS } },
        ],
      },
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })
    for (const inquiry of docs) {
      retried++
      const result = await deliverInquiryMail(payload, inquiry, target)
      if (result.ok) succeeded++
      else if (result.gaveUp) gaveUp++
    }
  }
  return Response.json({ ok: true, retried, succeeded, gaveUp })
}
