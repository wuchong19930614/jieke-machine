// 前台读取内容：正常访问只读已发布内容；后台预览（草稿模式）读最新草稿（技术方案 2.3、5.3）
import { draftMode } from 'next/headers'
import type { Where } from 'payload'
import { cache } from 'react'

import { withDefaults } from '@/content/defineTexts'
import * as T from '@/content/texts'
import type {
  AboutPage,
  Case,
  CasesPage,
  ContactPage,
  HomePage,
  Media,
  Page,
  Product,
  ProductsPage,
  SiteSetting,
  Theme,
  UiText,
} from '@/payload-types'

import { getPayloadClient } from './payload'

export const isDraft = cache(async (): Promise<boolean> => (await draftMode()).isEnabled)

type WithStatus = { _status?: ('draft' | 'published') | null }

// 关联字段在本地接口里不会按发布状态过滤，前台显示前统一判断
export function isVisibleDoc<T>(doc: T | number | string | null | undefined, draft: boolean): doc is T {
  if (!doc || typeof doc !== 'object') return false
  return draft || (doc as WithStatus)._status === 'published'
}

export const asMedia = (value: unknown): Media | null =>
  value && typeof value === 'object' && 'url' in (value as Media) ? (value as Media) : null

async function global<TDoc>(slug: string, draft: boolean, depth = 2): Promise<TDoc> {
  const payload = await getPayloadClient()
  return (await payload.findGlobal({ slug: slug as never, draft, depth })) as TDoc
}

export const getSettings = cache(async (draft: boolean) => {
  const settings = await global<SiteSetting>('site-settings', draft, 1)
  return {
    raw: settings,
    companyName: settings.companyName ?? '',
    logo: asMedia(settings.logo),
    footerIntro: settings.footerIntro ?? '',
    email: settings.email ?? '',
    phone: settings.phone ?? '',
    whatsapp: settings.whatsapp ?? '',
    address: settings.address ?? '',
    officeHours: settings.officeHours ?? '',
    social: {
      facebook: settings.facebook ?? '',
      instagram: settings.instagram ?? '',
      tiktok: settings.tiktok ?? '',
      youtube: settings.youtube ?? '',
      linkedin: settings.linkedin ?? '',
    },
    nav: withDefaults(T.NAV_TEXTS, settings.navLabels),
    floating: withDefaults(T.FLOATING_TEXTS, settings.floatingTools),
    contactBand: withDefaults(T.CONTACT_BAND_TEXTS, settings.contactBand),
    form: withDefaults(T.FORM_TEXTS, settings.formTexts),
    redPanel: withDefaults(T.RED_PANEL_TEXTS, settings.redPanel),
    bluePanel: withDefaults(T.BLUE_PANEL_TEXTS, settings.bluePanel),
    whatsappTexts: withDefaults(T.WHATSAPP_TEXTS, settings.whatsappTexts),
    autoReply: withDefaults(T.AUTO_REPLY_TEXTS, settings.autoReply),
    seo: withDefaults(T.SEO_TEXTS, settings.seoTexts),
    notifyEmail: settings.notifyEmail ?? '',
    tawkPropertyId: settings.tawkPropertyId ?? '',
    tawkWidgetId: settings.tawkWidgetId ?? '',
    gtmId: settings.gtmId ?? '',
    allowIndexing: Boolean(settings.allowIndexing),
    turnstileEnabled: Boolean(settings.turnstileEnabled && settings.turnstileSiteKey),
    turnstileSiteKey: settings.turnstileSiteKey ?? '',
    defaultOgImage: asMedia(settings.defaultOgImage),
    favicon: asMedia(settings.favicon),
    appleTouchIcon: asMedia(settings.appleTouchIcon),
  }
})
export type Settings = Awaited<ReturnType<typeof getSettings>>

export const getUiTexts = cache(async (draft: boolean) => {
  const ui = await global<UiText>('ui-texts', draft, 0)
  return {
    common: withDefaults(T.UI_COMMON, ui.common),
    topBar: withDefaults(T.UI_TOPBAR, ui.topBar),
    footer: withDefaults(T.UI_FOOTER, ui.footer),
    mobileBar: withDefaults(T.UI_MOBILE, ui.mobileBar),
    banner: withDefaults(T.UI_BANNER, ui.banner),
    productList: withDefaults(T.UI_PRODUCT_LIST, ui.productList),
    product: withDefaults(T.UI_PRODUCT, ui.product),
    caseList: withDefaults(T.UI_CASE_LIST, ui.caseList),
    caseDetail: withDefaults(T.UI_CASE_DETAIL, ui.caseDetail),
    cookie: withDefaults(T.UI_COOKIE, ui.cookie),
    thankYou: withDefaults(T.UI_THANK_YOU, ui.thankYou),
    notFound: withDefaults(T.UI_NOT_FOUND, ui.notFound),
    error: withDefaults(T.UI_ERROR, ui.error),
    pageTitles: withDefaults(T.UI_PAGE_TITLES, ui.pageTitles),
  }
})
export type UiTexts = Awaited<ReturnType<typeof getUiTexts>>

export const getTheme = cache(async (draft: boolean) => global<Theme>('theme', draft, 0))

export const getHomePage = cache(async (draft: boolean) => global<HomePage>('home-page', draft, 2))
export const getAboutPage = cache(async (draft: boolean) => global<AboutPage>('about-page', draft, 2))
export const getProductsPage = cache(async (draft: boolean) => global<ProductsPage>('products-page', draft, 1))
export const getCasesPage = cache(async (draft: boolean) => global<CasesPage>('cases-page', draft, 1))
export const getContactPage = cache(async (draft: boolean) => global<ContactPage>('contact-page', draft, 1))

const published = (draft: boolean): Where => (draft ? {} : { _status: { equals: 'published' } })

export const getProducts = cache(async (draft: boolean): Promise<Product[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'products',
    draft,
    depth: 1,
    limit: 200,
    pagination: false,
    sort: '_order',
    where: published(draft),
  })
  return docs
})

export const getProduct = cache(async (slug: string, draft: boolean): Promise<Product | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'products',
    draft,
    depth: 2,
    limit: 1,
    where: { and: [{ slug: { equals: slug } }, published(draft)] },
  })
  return docs[0] ?? null
})

export const getCases = cache(
  async (draft: boolean, page: number, limit: number): Promise<{ docs: Case[]; totalPages: number; page: number }> => {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'cases',
      draft,
      depth: 1,
      limit,
      page,
      sort: '_order',
      where: published(draft),
    })
    return { docs: result.docs, totalPages: Math.max(1, result.totalPages), page: result.page ?? page }
  },
)

export const getCase = cache(async (slug: string, draft: boolean): Promise<Case | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'cases',
    draft,
    depth: 2,
    limit: 1,
    where: { and: [{ slug: { equals: slug } }, published(draft)] },
  })
  return docs[0] ?? null
})

export const getAuxPage = cache(async (slug: T.AuxPageSlug, draft: boolean): Promise<Page | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    draft,
    depth: 1,
    limit: 1,
    where: { and: [{ slug: { equals: slug } }, published(draft)] },
  })
  return docs[0] ?? null
})

// 所有已发布产品和案例的网址短名，用于预生成静态页面和网站地图
export async function publishedSlugs(collection: 'products' | 'cases') {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection,
    depth: 0,
    limit: 1000,
    pagination: false,
    where: { _status: { equals: 'published' } },
    select: { slug: true, updatedAt: true },
  })
  return docs as { slug: string; updatedAt: string }[]
}

// 内容跳转：只在页面找不到时查一次（技术方案 3.9）
export async function findRedirect(path: string): Promise<string | null> {
  const payload = await getPayloadClient()
  const from = `/${path.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/')
  const { docs } = await payload.find({ collection: 'redirects', depth: 1, limit: 1, where: { from: { equals: from } } })
  const doc = docs[0]
  if (!doc?.to) return null
  if (doc.to.type === 'custom' && doc.to.url) return doc.to.url
  const ref = doc.to.reference
  if (ref && typeof ref.value === 'object' && ref.value && 'slug' in ref.value) {
    const slug = (ref.value as { slug?: string }).slug
    if (!slug) return null
    return ref.relationTo === 'products' ? `/products/${slug}/` : `/case-studies/${slug}/`
  }
  return null
}
