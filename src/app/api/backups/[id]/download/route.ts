// GET /api/backups/{id}/download：下载加密后的数据库备份（技术方案 6.6），需要管理员并通过双重验证
import { getPayloadClient } from '@/lib/payload'
import { openBackupFile } from '@/lib/server/backup/storage'
import { checkStaff } from '@/lib/staffAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayloadClient()
  const auth = await checkStaff(payload, request.headers, ['admin'])
  if (!auth.ok) {
    const message = auth.code === 'FORBIDDEN' ? '只有管理员可以下载备份。' : '请先登录后台并完成双重验证，再下载备份。'
    return Response.json({ ok: false, code: auth.code, message }, { status: auth.status })
  }
  const { id } = await params
  const backup = await payload.findByID({ collection: 'backups', id, depth: 0, overrideAccess: true, disableErrors: true })
  const file = backup?.kind === 'database' && backup.status === 'success' && backup.file ? await openBackupFile(backup.file) : null
  if (!file) return Response.json({ ok: false, code: 'NOT_FOUND', message: '找不到这份备份文件：可能是失败的备份，或已超过 30 天被自动清理。' }, { status: 404 })
  const filename = backup!.file!.split('/').pop()
  return new Response(file.stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
      ...(file.size ? { 'Content-Length': String(file.size) } : {}),
    },
  })
}
