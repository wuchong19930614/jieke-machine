import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const isProd = process.env.NODE_ENV === 'production'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// 前台内容安全策略（技术方案 9.1）：静态页面不能用 nonce，脚本来源用 'self' + 'unsafe-inline' + 白名单。
// 以后在 GTM 里新增广告标签时，要把对应域名补进来
const frontendCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"} https://www.googletagmanager.com https://www.google-analytics.com https://embed.tawk.to https://*.tawk.to https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline' https://embed.tawk.to https://*.tawk.to",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://i.ytimg.com https://*.tawk.to https://www.googletagmanager.com https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self' data: https://*.tawk.to",
  `connect-src 'self'${isProd ? '' : ' ws: wss:'} https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.tawk.to wss://*.tawk.to https://challenges.cloudflare.com`,
  "frame-src 'self' https://www.youtube-nocookie.com https://*.tawk.to https://challenges.cloudflare.com https://www.googletagmanager.com",
  "media-src 'self' https://*.tawk.to",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // 后台实时预览要在同站框架里显示前台，所以是 'self' 而不是 'none'
  "frame-ancestors 'self'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ')

// 后台单独一套较宽松的策略，只限制嵌入、插件对象和 base 标签
const adminCsp = ["frame-ancestors 'self'", "object-src 'none'", "base-uri 'self'"].join('; ')

// 测试环境（Vercel 预览）和本地全站不收录（技术方案 2.2、8.1）
const isProductionSite = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : isProd

const commonHeaders = [
  ...(isProductionSite ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] : []),
]

// www 与非 www 统一跳转到 NEXT_PUBLIC_SITE_URL 的写法（技术方案 8.1），由 CDN 直接执行
function hostRedirects() {
  let host: string
  try {
    host = new URL(siteUrl).host
  } catch {
    return []
  }
  if (!isProd || host.startsWith('localhost') || host.includes('vercel.app')) return []
  const other = host.startsWith('www.') ? host.slice(4) : `www.${host}`
  return [{ source: '/:path*', has: [{ type: 'host' as const, value: other }], destination: `${siteUrl}/:path*`, permanent: true }]
}

const nextConfig: NextConfig = {
  // 网址统一以斜杠结尾（技术方案 4.1）。只给前台页面补斜杠（见 redirects），
  // 接口和后台不跳转，否则后台每个接口请求都要多一次 308 往返
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // 横幅桌面图用 80，其余用默认 75
    qualities: [75, 80],
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
    localPatterns: [{ pathname: '/api/cms/media/file/**' }],
  },
  async headers() {
    return [
      { source: '/:path*', headers: commonHeaders },
      { source: '/((?!admin).*)', headers: [{ key: 'Content-Security-Policy', value: frontendCsp }] },
      { source: '/admin/:path*', headers: [{ key: 'Content-Security-Policy', value: adminCsp }] },
    ]
  },
  async redirects() {
    return [
      ...hostRedirects(),
      // 前台页面统一补结尾斜杠；排除接口、后台、静态资源和带扩展名的文件（sitemap.xml、robots.txt 等）
      // Next 会在规则末尾自动追加可选斜杠，(?!.*/$) 用来排除已经带斜杠的地址，避免自己跳自己
      {
        source: '/:path((?!api(?:/|$)|admin(?:/|$)|_next/)(?![^?]*\\.[a-zA-Z0-9]{2,5}$)(?!.*/$).*[^/])',
        destination: '/:path/',
        permanent: true,
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
