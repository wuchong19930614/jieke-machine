// Payload 后台配置（技术方案第三、五章）
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { EXPERIMENTAL_TableFeature, lexicalEditor, LinkFeature } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { zh } from '@payloadcms/translations/languages/zh'
import path from 'path'
import { buildConfig, type CollectionConfig } from 'payload'
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
import { keepSessionInPlugin } from './lib/server/pluginSession'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SITE_URL = siteUrl()

const withoutLocalFiles = (collection: CollectionConfig): CollectionConfig =>
  typeof collection.upload === 'object' ? { ...collection, upload: { ...collection.upload, disableLocalStorage: true } } : collection
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
      // 左侧菜单按技术方案 5.1 的顺序排列，见组件内说明
      Nav: '@/admin/components/Nav#Nav',
      providers: ['@/admin/components/LocateProvider#LocateProvider'],
      views: {
        search: { Component: '@/admin/views/SearchView#SearchView', path: '/search' },
        contentTransfer: { Component: '@/admin/views/ContentTransferView#ContentTransferView', path: '/content-transfer' },
        guide: { Component: '@/admin/views/GuideView#GuideView', path: '/guide', meta: { title: '操作教程' } },
      },
    },
    // 后台首页卡片按左侧菜单的顺序排列（见 src/admin/components/DashboardCards.tsx）。
    // Payload 自带的 collections 卡片仍会注册（编辑仪表板时可以添加），默认布局改用这里的版本
    dashboard: {
      widgets: [{ slug: 'content-cards', label: '内容入口', Component: '@/admin/components/DashboardCards#DashboardCards', minWidth: 'full' }],
      defaultLayout: [{ widgetSlug: 'content-cards', width: 'full' }],
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
  // 富文本的内部链接只允许指向前台有页面的内容（默认会列出全部集合，包括用户和询盘）；
  // 开启表格：隐私政策和 Cookie 说明里有处理目的、服务商和 Cookie 清单三张表
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== 'link'),
      LinkFeature({ enabledCollections: ['products', 'cases', 'pages'] }),
      EXPERIMENTAL_TableFeature(),
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
      // 前台用 Next.js 的 permanentRedirect 跳转，固定返回 308（永久跳转，搜索引擎与 301 同样处理），见 lib/redirectOr404.ts
      redirectTypes: ['308'],
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
      // 插件按用户编号重新查当前用户，会丢掉双重验证的会话标记，见 lib/server/pluginSession.ts；
      // 上传的 JSON / CSV 只在本次请求里处理，不写本地磁盘（Vercel 的函数目录不可写）
      overrideExportCollection: ({ collection }) => keepSessionInPlugin({ collection: withoutLocalFiles(collection) }),
      overrideImportCollection: ({ collection }) => keepSessionInPlugin({ collection: withoutLocalFiles(collection) }),
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
