// 案例列表第 n 页（技术方案 4.1）：第 1 页统一用 /case-studies/，超出页数显示 404
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { casePageCount, CaseList, caseListMeta } from '@/components/CaseList'
import { fill } from '@/content/defineTexts'
import { isDraft } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

type Params = { params: Promise<{ n: string }> }

export const dynamicParams = true

export async function generateStaticParams() {
  const total = await casePageCount(false)
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ n: String(i + 2) }))
}

const parse = (n: string) => (/^\d+$/.test(n) ? Number(n) : NaN)

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const n = parse((await params).n)
  const { settings, texts, ui, page } = await caseListMeta(await isDraft())
  const pageName = fill(ui.pageTitles.casesPaged, { n }) || `${texts.title} – Page ${n}`
  return buildMetadata({ settings, path: `/case-studies/page/${n}/`, pageName, seo: { ...page.seo, seoTitle: null } })
}

export default async function CaseStudiesPagedPage({ params }: Params) {
  const n = parse((await params).n)
  if (!Number.isInteger(n) || n < 1) notFound()
  if (n === 1) permanentRedirect('/case-studies/')
  const total = await casePageCount(await isDraft())
  if (n > total) notFound()
  return <CaseList pageNumber={n} />
}
