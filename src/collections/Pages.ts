// 辅助页面：隐私政策、Cookie 说明、提交成功页、404 页（技术方案 3.3）
import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { isLoggedIn, pagesEditAccess } from '@/access'
import { at, seoGroup } from '@/fields'
import { rejectChineseOnPublish } from '@/hooks/publishChecks'
import { PATHS, revalidate } from '@/hooks/revalidate'

export const AUX_PAGES = [
  { label: '隐私政策 /privacy-policy/', value: 'privacy-policy' },
  { label: 'Cookie 说明 /cookie-notice/', value: 'cookie-notice' },
  { label: '提交成功页 /thank-you/', value: 'thank-you' },
  { label: '404 页', value: 'not-found' },
] as const

const refresh: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (doc?._status === 'published' || previousDoc?._status === 'published') revalidate(req, [PATHS.everything])
  return doc
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: '辅助页面', plural: '辅助页面' },
  admin: {
    group: '页面管理',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: '隐私政策和 Cookie 说明的正文按 docs/隐私政策与Cookie说明模板（含巴西LGPD）.md 填写',
  },
  access: {
    read: isLoggedIn,
    create: pagesEditAccess,
    update: pagesEditAccess,
    delete: pagesEditAccess,
    readVersions: isLoggedIn,
  },
  versions: { drafts: { autosave: false, schedulePublish: false }, maxPerDoc: 50 },
  hooks: {
    beforeChange: [rejectChineseOnPublish],
    afterChange: [refresh],
    afterDelete: [({ doc, req }) => (revalidate(req, [PATHS.everything]), doc)],
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      label: '页面',
      required: true,
      unique: true,
      options: [...AUX_PAGES],
      admin: { position: 'sidebar', description: at('选项里的网址；决定这条内容显示在哪个辅助页面') },
    },
    { name: 'title', type: 'text', label: '页面标题', required: true, admin: { description: at('页面主标题') } },
    { name: 'content', type: 'richText', label: '正文', admin: { description: at('页面正文') } },
    seoGroup('本页'),
  ],
}
