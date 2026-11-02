// GET /api/preview：开启草稿模式并跳转到对应页面（技术方案 6.3）；需要预览密钥且已登录后台
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { frontendPath } from '@/lib/previewPath'
import { safeEqual } from '@/lib/server/secrets'
import { checkStaff } from '@/lib/staffAuth'

export const dynamic = 'force-dynamic'

const COLLECTIONS = ['products', 'cases', 'pages']

// 提示显示在后台的实时预览窗口里，写清原因和怎么处理
const fail = (message: string, status: number) => new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret') ?? ''
  const collection = url.searchParams.get('collection') ?? ''
  const slug = url.searchParams.get('slug')
  const expected = process.env.PREVIEW_SECRET
  if (!expected) return fail('无法打开预览：网站没有配置预览密钥 PREVIEW_SECRET，请联系开发人员在 Vercel 环境变量里补上并重新部署。', 500)
  if (!safeEqual(secret, expected)) return fail('无法打开预览：预览密钥不一致，网站可能刚换过密钥。请刷新后台页面后再打开预览；仍然不行请联系开发人员。', 401)

  const payload = await getPayloadClient()
  const auth = await checkStaff(payload, request.headers, ['admin', 'editor', 'sales', 'developer'])
  if (!auth.ok) {
    const message = auth.code === 'FORBIDDEN' ? '无法打开预览：当前账号没有使用预览的权限。' : '无法打开预览：登录已过期或还没完成双重验证，请回到后台重新登录后再打开预览。'
    return fail(message, auth.status)
  }

  const path = COLLECTIONS.includes(collection) ? frontendPath({ collection, slug }) : frontendPath({ global: collection })
  if (!path) return fail('这条内容还没有对应的前台页面：产品和案例要先填写网址短名并保存草稿；辅助页面要先选择是哪一个页面。', 400)

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
