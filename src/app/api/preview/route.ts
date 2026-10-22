// GET /api/preview：开启草稿模式并跳转到对应页面（技术方案 6.3）；需要预览密钥且已登录后台
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { frontendPath } from '@/lib/previewPath'
import { safeEqual } from '@/lib/server/secrets'
import { checkStaff } from '@/lib/staffAuth'

export const dynamic = 'force-dynamic'

const COLLECTIONS = ['products', 'cases', 'pages']

export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret') ?? ''
  const collection = url.searchParams.get('collection') ?? ''
  const slug = url.searchParams.get('slug')
  const expected = process.env.PREVIEW_SECRET
  if (!expected || !safeEqual(secret, expected)) return new Response('Invalid preview secret', { status: 401 })

  const payload = await getPayloadClient()
  const auth = await checkStaff(payload, request.headers, ['admin', 'editor', 'sales', 'developer'])
  if (!auth.ok) return new Response('Please log in to the admin panel first', { status: 401 })

  const path = COLLECTIONS.includes(collection) ? frontendPath({ collection, slug }) : frontendPath({ global: collection })
  if (!path) return new Response('Unknown preview target', { status: 400 })

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
