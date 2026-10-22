// GET /api/cron/backup：每天 02:00（UTC）备份数据库（技术方案 6.4、9.2）
import { getPayloadClient } from '@/lib/payload'
import { runDatabaseBackup } from '@/lib/server/backup/run'
import { isCronRequest, unauthorized } from '@/lib/server/cron'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  if (!isCronRequest(request)) return unauthorized()
  const result = await runDatabaseBackup(await getPayloadClient())
  return Response.json(result, { status: result.ok ? 200 : 500 })
}
