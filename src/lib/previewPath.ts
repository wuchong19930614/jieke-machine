// 后台内容对应的前台网址：草稿预览、实时预览和前台定位共用
export const GLOBAL_PATHS: Record<string, string> = {
  'home-page': '/',
  'about-page': '/about/',
  'products-page': '/products/',
  'cases-page': '/case-studies/',
  'contact-page': '/contact/',
  'site-settings': '/',
  theme: '/',
  'ui-texts': '/',
}

const PAGE_PATHS: Record<string, string> = {
  'privacy-policy': '/privacy-policy/',
  'cookie-notice': '/cookie-notice/',
  'thank-you': '/thank-you/',
  // 404 页没有固定网址，预览时打开一个不存在的地址
  'not-found': '/preview-not-found/',
}

export function frontendPath(args: { collection?: string | null; global?: string | null; slug?: string | null }): string | null {
  const { collection, global, slug } = args
  if (global) return GLOBAL_PATHS[global] ?? null
  if (collection === 'products') return slug ? `/products/${slug}/` : '/products/'
  if (collection === 'cases') return slug ? `/case-studies/${slug}/` : '/case-studies/'
  if (collection === 'pages') return slug ? (PAGE_PATHS[slug] ?? null) : null
  return null
}

export const siteUrl = (): string => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
