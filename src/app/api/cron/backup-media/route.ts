// GET /api/cron/backup-media：每天 03:00（UTC）增量备份新增的图片和 PDF（技术方案 6.4、9.2）
import { getPayloadClient } from '@/lib/payload'
import { runMediaBackup } from '@/lib/server/backup/run'
import { isCronRequest, unauthorized } from '@/lib/server/cron'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  if (!isCronRequest(request)) return unauthorized()
  const result = await runMediaBackup(await getPayloadClient())
  return Response.json(result, { status: result.ok ? 200 : 500 })
}
