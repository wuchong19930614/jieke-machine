// 重发询盘邮件（技术方案 6.4）：发送失败的，以及超过 10 分钟仍是“待发送”的（提交请求在写库后被中断时会停在这个状态）；
// 累计发送达到 10 次后不再自动重发，后台仍可手动重发。
// Vercel 免费版的定时任务每天只跑一次，所以每天的维护任务和每次有新询盘提交后都会调用
import type { Payload, Where } from 'payload'

import { MAX_NOTIFY_ATTEMPTS } from '@/lib/constants'

import { deliverInquiryMail, type MailTarget } from './inquiryMail'

const STALE_PENDING_MINUTES = 10
// 最近 5 分钟内更新过的询盘先不重发：几位访客同时提交时，各自的重发不会把同一封失败邮件发好几次
const RETRY_GAP_MINUTES = 5

const TARGETS: { target: MailTarget; status: string; attempts: string }[] = [
  { target: 'notify', status: 'notifyStatus', attempts: 'notifyAttempts' },
  { target: 'autoReply', status: 'autoReplyStatus', attempts: 'autoReplyAttempts' },
]

export type RetryResult = { retried: number; succeeded: number; gaveUp: number }

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString()

export async function retryFailedMail(payload: Payload, { limit = 50, excludeId }: { limit?: number; excludeId?: number } = {}): Promise<RetryResult> {
  const result: RetryResult = { retried: 0, succeeded: 0, gaveUp: 0 }
  for (const { target, status, attempts } of TARGETS) {
    const where: Where = {
      and: [
        {
          or: [
            { [status]: { equals: 'failed' } },
            { and: [{ [status]: { equals: 'pending' } }, { createdAt: { less_than: minutesAgo(STALE_PENDING_MINUTES) } }] },
          ],
        },
        { [attempts]: { less_than: MAX_NOTIFY_ATTEMPTS } },
        { updatedAt: { less_than: minutesAgo(RETRY_GAP_MINUTES) } },
        ...(excludeId ? [{ id: { not_equals: excludeId } }] : []),
      ],
    }
    const { docs } = await payload.find({ collection: 'inquiries', where, limit, depth: 0, overrideAccess: true })
    for (const inquiry of docs) {
      result.retried++
      const delivery = await deliverInquiryMail(payload, inquiry, target)
      if (delivery.ok) result.succeeded++
      else if (delivery.gaveUp) result.gaveUp++
    }
  }
  return result
}
