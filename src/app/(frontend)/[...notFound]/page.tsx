// 其他不存在的网址：先查跳转表（技术方案 3.9），没有规则就显示 404
import type { Metadata } from 'next'

import { notFoundMetadata } from '@/components/AuxPage'
import { isDraft } from '@/lib/data'
import { redirectOr404 } from '@/lib/redirectOr404'

type Params = { params: Promise<{ notFound: string[] }> }

export const dynamic = 'force-dynamic'

// 这里只会显示 404 或跳转，标题直接用 404 页的
export async function generateMetadata(): Promise<Metadata> {
  return notFoundMetadata(await isDraft())
}

export default async function CatchAll({ params }: Params) {
  const { notFound: segments } = await params
  return redirectOr404(`/${segments.map(decodeURIComponent).join('/')}/`)
}
