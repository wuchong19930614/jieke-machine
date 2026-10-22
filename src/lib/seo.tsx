// 页面标签（技术方案 8.1）：标题模板、规范网址、分享预览、收录控制、结构化数据
import type { Metadata } from 'next'

import { fill } from '@/content/defineTexts'
import type { Media } from '@/payload-types'

import type { Settings } from './data'
import { siteUrl } from './previewPath'

// 只有正式环境才允许收录；测试环境（Vercel 预览）和本地开发始终 noindex
export const isProductionSite = (): boolean =>
  process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : process.env.NODE_ENV === 'production'

export const indexingAllowed = (settings: Settings): boolean => isProductionSite() && settings.allowIndexing

type SeoFields = { seoTitle?: string | null; seoDescription?: string | null; ogImage?: unknown; noindex?: boolean | null } | null | undefined

type Options = {
  settings: Settings
  path: string
  pageName: string
  description?: string | null
  seo?: SeoFields
  image?: Media | null
  noindex?: boolean
  isHome?: boolean
}

const asImage = (value: unknown): Media | null => (value && typeof value === 'object' && 'url' in value ? (value as Media) : null)

// 页面标题模板（全站设置 › 默认 SEO），如 “Products | 公司名”
export const templateTitle = (settings: Settings, pageName: string): string =>
  fill(settings.seo.titleTemplate, { title: pageName, companyName: settings.companyName }) || pageName

export function buildMetadata({ settings, path, pageName, description, seo, image, noindex, isHome }: Options): Metadata {
  const base = siteUrl()
  const defaultTitle = isHome ? fill(settings.seo.homeTitle, { companyName: settings.companyName }) || pageName : templateTitle(settings, pageName)
  const title = seo?.seoTitle || defaultTitle
  const desc = (seo?.seoDescription || description || settings.seo.defaultDescription || '').slice(0, 300) || undefined
  const og = asImage(seo?.ogImage) ?? image ?? settings.defaultOgImage
  const blockIndex = noindex || Boolean(seo?.noindex) || !indexingAllowed(settings)
  const url = `${base}${path}`
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: url },
    robots: blockIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title,
      description: desc,
      siteName: settings.companyName || undefined,
      images: og?.url ? [{ url: og.url, width: og.width ?? undefined, height: og.height ?? undefined, alt: og.alt ?? '' }] : undefined,
    },
    twitter: {
      card: og?.url ? 'summary_large_image' : 'summary',
      title,
      description: desc,
      images: og?.url ? [og.url] : undefined,
    },
  }
}

// 全站结构化数据：Organization + WebSite（技术方案 8.1）
export function organizationJsonLd(settings: Settings) {
  const base = siteUrl()
  const sameAs = Object.values(settings.social).filter(Boolean)
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings.companyName || undefined,
      url: base,
      logo: settings.logo?.url || undefined,
      email: settings.email || undefined,
      telephone: settings.phone || undefined,
      address: settings.address ? { '@type': 'PostalAddress', streetAddress: settings.address } : undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: settings.companyName || undefined, url: base },
  ]
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: `${base}${item.path}` })),
  }
}

export function JsonLd({ data }: { data: unknown }) {
  // 结构化数据里的内容全部来自后台字段，序列化时转义 <，避免提前结束 script 标签
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
