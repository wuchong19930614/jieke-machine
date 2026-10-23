// GET /api/cron/backup：每天一次（UTC 02:00 这一小时内），先备份数据库，再增量备份新增的图片和 PDF（技术方案 6.4、9.2）。
// Vercel 免费版的定时任务只保证在设定的那一小时内执行，分开的任务先后顺序没法保证，所以两项备份合在一个任务里依次执行；数据库备份失败时照常备份媒体
import { getPayloadClient } from '@/lib/payload'
import { runDatabaseBackup, runMediaBackup } from '@/lib/server/backup/run'
import { isCronRequest, unauthorized } from '@/lib/server/cron'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  if (!isCronRequest(request)) return unauthorized()
  const payload = await getPayloadClient()
  const database = await runDatabaseBackup(payload)
  const media = await runMediaBackup(payload)
  const ok = database.ok && media.ok
  return Response.json({ ok, database, media }, { status: ok ? 200 : 500 })
}
