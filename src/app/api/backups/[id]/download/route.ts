// GET /api/backups/{id}/download：下载加密后的数据库备份（技术方案 6.6），需要管理员并通过双重验证
import { getPayloadClient } from '@/lib/payload'
import { openBackupFile } from '@/lib/server/backup/storage'
import { checkStaff } from '@/lib/staffAuth'

export const dynamic = 'force-dynamic'

// 后台“下载”链接是浏览器直接打开的：失败时浏览器会把 JSON 原样显示出来，所以给浏览器返回一页中文说明；
// 其他调用方（脚本等）仍然拿到 JSON
function fail(request: Request, status: number, code: string, message: string): Response {
  if (!request.headers.get('accept')?.includes('text/html')) return Response.json({ ok: false, code, message }, { status })
  const escaped = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>无法下载备份</title></head>
<body style="font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;max-width:560px;margin:15vh auto;padding:0 16px;line-height:1.7;color:#222">
<h1 style="font-size:20px">无法下载备份</h1><p>${escaped}</p><p><a href="/admin/collections/backups">返回备份记录</a></p></body></html>`
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayloadClient()
  const auth = await checkStaff(payload, request.headers, ['admin'])
  if (!auth.ok) {
    const message = auth.code === 'FORBIDDEN' ? '只有管理员可以下载备份。' : '请先登录后台并完成双重验证，再下载备份。'
    return fail(request, auth.status, auth.code, message)
  }
  const { id } = await params
  const backup = await payload.findByID({ collection: 'backups', id, depth: 0, overrideAccess: true, disableErrors: true })
  const file = backup?.kind === 'database' && backup.status === 'success' && backup.file ? await openBackupFile(backup.file) : null
  if (!file) return fail(request, 404, 'NOT_FOUND', '找不到这份备份文件：可能是失败的备份，或已超过 30 天被自动清理。')
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
