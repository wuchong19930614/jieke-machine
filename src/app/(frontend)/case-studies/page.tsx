// 案例列表第 1 页
import type { Metadata } from 'next'

import { CaseList, caseListMeta } from '@/components/CaseList'
import { isDraft } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { settings, texts, page } = await caseListMeta(await isDraft())
  return buildMetadata({ settings, path: '/case-studies/', pageName: texts.title, description: texts.listSubtitle, seo: page.seo })
}

export default function CaseStudiesPage() {
  return <CaseList pageNumber={1} />
}
