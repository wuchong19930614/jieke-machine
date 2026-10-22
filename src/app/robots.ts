// robots.txt（技术方案 8.1）：正式环境且后台允许收录时开放抓取，排除后台、接口和感谢页；其他情况全部禁止
import type { MetadataRoute } from 'next'

import { getSettings } from '@/lib/data'
import { siteUrl } from '@/lib/previewPath'
import { indexingAllowed } from '@/lib/seo'

export const revalidate = 3600

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings(false)
  if (!indexingAllowed(settings)) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/thank-you/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
