// Payload 后台配置（技术方案第三、五章）
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { lexicalEditor, LinkFeature } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { zh } from '@payloadcms/translations/languages/zh'
import path from 'path'
import { buildConfig } from 'payload'
import { payloadTotp } from 'payload-totp'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { isContentRole, isLoggedIn } from './access'
import { Backups } from './collections/Backups'
import { Cases } from './collections/Cases'
import { Inquiries } from './collections/Inquiries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { AboutPage } from './globals/AboutPage'
import { HomePage } from './globals/HomePage'
import { CasesPage, ContactPage, ProductsPage } from './globals/ListPages'
import { SiteSettings } from './globals/SiteSettings'
import { Theme } from './globals/Theme'
import { UiTexts } from './globals/UiTexts'
import { PATHS, revalidate } from './hooks/revalidate'
import { siteUrl } from './lib/previewPath'
import { resendEmailAdapter } from './lib/server/payloadEmail'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SITE_URL = siteUrl()
const PREVIEW_COLLECTIONS = ['products', 'cases', 'pages']
const PREVIEW_GLOBALS = ['home-page', 'about-page', 'products-page', 'cases-page', 'contact-page', 'site-settings', 'theme', 'ui-texts']

// 预览地址按技术方案 6.3：secret + collection（或页面配置名）+ slug，由接口换算成前台网址，避免任意跳转
const previewUrl = (params: { collection?: string; global?: string; slug?: string | null }): string => {
  const query = new URLSearchParams({ secret: process.env.PREVIEW_SECRET || '' })
  query.set('collection', params.collection ?? params.global ?? '')
  if (params.slug) query.set('slug', params.slug)
  return `${SITE_URL}/api/preview?${query.toString()}`
}

export default buildConfig({
  serverURL: SITE_URL,
  secret: process.env.PAYLOAD_SECRET || '',
  cookiePrefix: 'jieke',
  csrf: [SITE_URL],
  cors: [SITE_URL],
  telemetry: false,
  // Payload 自带接口放到 /api/cms，/api 下其他路径留给网站自己的接口（询盘、预览、定时任务）
  routes: { api: '/api/cms', admin: '/admin' },
  graphQL: { disable: true },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · 网站后台' },
    dateFormat: 'yyyy-MM-dd HH:mm',
    components: {
      beforeDashboard: ['@/admin/components/BeforeDashboard#BeforeDashboard'],
      providers: ['@/admin/components/LocateProvider#LocateProvider'],
      views: {
        search: { Component: '@/admin/views/SearchView#SearchView', path: '/search' },
        contentTransfer: { Component: '@/admin/views/ContentTransferView#ContentTransferView', path: '/content-transfer' },
      },
    },
    livePreview: {
      collections: PREVIEW_COLLECTIONS,
      globals: PREVIEW_GLOBALS,
      url: ({ collectionConfig, globalConfig, data }) =>
        previewUrl({
          collection: collectionConfig?.slug,
          global: globalConfig?.slug,
          slug: (data as { slug?: string } | undefined)?.slug,
        }),
      breakpoints: [
        { label: '手机', name: 'mobile', width: 390, height: 844 },
        { label: '平板', name: 'tablet', width: 820, height: 1180 },
        { label: '桌面', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  i18n: {
    supportedLanguages: { zh },
    fallbackLanguage: 'zh',
  },
  collections: [Pages, Products, Cases, Media, Inquiries, Users, Backups],
  globals: [SiteSettings, Theme, UiTexts, HomePage, AboutPage, ProductsPage, CasesPage, ContactPage],
  // 富文本的内部链接只允许指向前台有页面的内容（默认会列出全部集合，包括用户和询盘）
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== 'link'),
      LinkFeature({ enabledCollections: ['products', 'cases', 'pages'] }),
    ],
  }),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./dev.db',
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  email: resendEmailAdapter,
  sharp,
  plugins: [
    redirectsPlugin({
      collections: ['products', 'cases'],
      redirectTypes: ['301'],
      overrides: {
        labels: { singular: '网址跳转', plural: '网址跳转' },
        admin: { group: '系统', description: '产品或案例修改网址短名时自动新增；一般不需要手工维护' },
        access: { read: isLoggedIn, create: isContentRole, update: isContentRole, delete: isContentRole },
        hooks: {
          afterChange: [({ doc, req }) => (revalidate(req, [PATHS.productDetails, PATHS.caseDetails]), doc)],
          afterDelete: [({ doc, req }) => (revalidate(req, [PATHS.productDetails, PATHS.caseDetails]), doc)],
        },
      },
    }),
    importExportPlugin({
      collections: [
        // 询盘只导出 CSV（技术方案 5.5）；同步导出、不在服务器保存文件
        { slug: 'inquiries', export: { format: 'csv', disableJobsQueue: true, disableSave: true }, import: false },
        // 产品、案例、媒体记录导出导入 JSON，保留关联和媒体引用（技术方案 5.3 第 7 点）
        { slug: 'products', export: { format: 'json', disableJobsQueue: true, disableSave: true }, import: { disableJobsQueue: true, defaultVersionStatus: 'draft' } },
        { slug: 'cases', export: { format: 'json', disableJobsQueue: true, disableSave: true }, import: { disableJobsQueue: true, defaultVersionStatus: 'draft' } },
        { slug: 'media', export: { format: 'json', disableJobsQueue: true, disableSave: true }, import: false },
      ],
    }),
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
      addRandomSuffix: true,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
      collections: {
        media: { prefix: 'media', disablePayloadAccessControl: true },
      },
    }),
    // 必须放在最后：它会给所有集合和全局配置的权限包一层双重验证检查（技术方案 3.8 第 1 点）
    payloadTotp({
      collection: 'users',
      forceSetup: true,
      disabled: process.env.TOTP_DISABLED === 'true' && process.env.NODE_ENV !== 'production',
      totp: { issuer: 'Jieke Website Admin' },
    }),
  ],
})

export { PREVIEW_COLLECTIONS, PREVIEW_GLOBALS }
