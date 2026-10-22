// GET /api/cron/cleanup：每天 02:30（UTC）清理过期询盘和备份（技术方案 6.4）
import { getPayloadClient } from '@/lib/payload'
import { runCleanup } from '@/lib/server/backup/run'
import { isCronRequest, unauthorized } from '@/lib/server/cron'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  if (!isCronRequest(request)) return unauthorized()
  const result = await runCleanup(await getPayloadClient())
  return Response.json(result)
}
