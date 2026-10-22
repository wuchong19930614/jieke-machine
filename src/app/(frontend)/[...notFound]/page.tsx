// 其他不存在的网址：先查跳转表（技术方案 3.9），没有规则就显示 404
import { redirectOr404 } from '@/lib/redirectOr404'

type Params = { params: Promise<{ notFound: string[] }> }

export const dynamic = 'force-dynamic'

export default async function CatchAll({ params }: Params) {
  const { notFound: segments } = await params
  return redirectOr404(`/${segments.map(decodeURIComponent).join('/')}/`)
}
