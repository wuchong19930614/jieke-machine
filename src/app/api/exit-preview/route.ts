// GET /api/exit-preview：退出草稿模式（技术方案 6.3）
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const draft = await draftMode()
  draft.disable()
  const target = new URL(request.url).searchParams.get('path')
  // 只允许跳回站内路径
  redirect(target && target.startsWith('/') && !target.startsWith('//') ? target : '/')
}
