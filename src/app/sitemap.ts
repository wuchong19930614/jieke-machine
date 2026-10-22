// 网站地图（技术方案 8.1）：已发布的栏目页、产品、案例和辅助页面，带最后更新时间；不含感谢页、404 和后台
import type { MetadataRoute } from 'next'

import { casePageCount } from '@/components/CaseList'
import { getPayloadClient } from '@/lib/payload'
import { siteUrl } from '@/lib/previewPath'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const payload = await getPayloadClient()
  const entries: MetadataRoute.Sitemap = ['/', '/about/', '/products/', '/case-studies/', '/contact/'].map((path) => ({ url: `${base}${path}` }))

  const total = await casePageCount(false)
  for (let n = 2; n <= total; n++) entries.push({ url: `${base}/case-studies/page/${n}/` })

  for (const collection of ['products', 'cases'] as const) {
    const { docs } = await payload.find({
      collection,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { and: [{ _status: { equals: 'published' } }, { 'seo.noindex': { not_equals: true } }] },
      select: { slug: true, updatedAt: true },
    })
    const prefix = collection === 'products' ? '/products/' : '/case-studies/'
    for (const doc of docs as { slug: string; updatedAt: string }[]) entries.push({ url: `${base}${prefix}${doc.slug}/`, lastModified: doc.updatedAt })
  }

  const { docs: pages } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 10,
    where: { and: [{ _status: { equals: 'published' } }, { slug: { in: ['privacy-policy', 'cookie-notice'] } }] },
    select: { slug: true, updatedAt: true },
  })
  const pageDates = Object.fromEntries((pages as { slug: string; updatedAt: string }[]).map((p) => [p.slug, p.updatedAt]))
  for (const slug of ['privacy-policy', 'cookie-notice']) entries.push({ url: `${base}/${slug}/`, lastModified: pageDates[slug] })

  return entries
}
