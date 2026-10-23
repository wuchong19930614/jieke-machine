// GET /api/cron/maintenance：每天一次（UTC 03:00 这一小时内），清理过期询盘和备份，再重发失败的询盘邮件（技术方案 6.4）。
// Vercel 免费版的定时任务每天只能运行一次、只保证在设定的那一小时内执行，所以两项合在一个任务里，和备份错开一小时；
// 失败的邮件不必等到第二天：新询盘提交后也会顺手重发，见 api/inquiries
import { getPayloadClient } from '@/lib/payload'
import { runCleanup } from '@/lib/server/backup/run'
import { isCronRequest, unauthorized } from '@/lib/server/cron'
import { safeError } from '@/lib/server/logSafe'
import { retryFailedMail } from '@/lib/server/retryMail'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  if (!isCronRequest(request)) return unauthorized()
  const payload = await getPayloadClient()
  // 两项各自出错时互不影响：清理失败也照常重发邮件
  const cleanup = await runCleanup(payload).catch((error: unknown) => ({ ok: false as const, error: safeError(error).message }))
  const mail = await retryFailedMail(payload)
    .then((result) => ({ ok: true as const, ...result }))
    .catch((error: unknown) => ({ ok: false as const, error: safeError(error).message }))
  const ok = cleanup.ok && mail.ok
  return Response.json({ ok, cleanup, mail }, { status: ok ? 200 : 500 })
}
