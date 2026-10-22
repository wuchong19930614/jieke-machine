// 客户案例（技术方案 3.5）
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

import { isLoggedIn, recordCreateDeleteAccess, recordEditAccess } from '@/access'
import { overrideGroup } from '@/content/overrideFields'
import { UI_CASE_DETAIL } from '@/content/texts'
import { at, imageField, seoGroup, slugField } from '@/fields'
import { rejectChineseOnPublish } from '@/hooks/publishChecks'
import { PATHS, revalidate } from '@/hooks/revalidate'
import { rememberPublishedSlug, slugRedirectHook } from '@/hooks/slugRedirect'
import { getCountries } from '@/lib/countries'
import { validateYoutubeUrl } from '@/lib/youtube'

const D = '案例详情'

const refresh: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (doc?._status === 'published' || previousDoc?._status === 'published') {
    revalidate(req, [PATHS.home, PATHS.caseList, PATHS.casePages, PATHS.caseDetails, PATHS.productDetails, PATHS.sitemap])
  }
  return doc
}

const refreshAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidate(req, [PATHS.home, PATHS.caseList, PATHS.casePages, PATHS.caseDetails, PATHS.productDetails, PATHS.sitemap])
  return doc
}

export const Cases: CollectionConfig = {
  slug: 'cases',
  labels: { singular: '案例', plural: '案例管理' },
  orderable: true,
  admin: {
    group: '案例管理',
    useAsTitle: 'title',
    defaultColumns: ['title', 'country', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug', 'customerName'],
    description: '列表里拖动可调整案例顺序，前台案例列表按这个顺序显示',
  },
  access: {
    read: isLoggedIn,
    create: recordCreateDeleteAccess(),
    update: recordEditAccess('cases'),
    delete: recordCreateDeleteAccess(),
    readVersions: isLoggedIn,
  },
  versions: {
    drafts: { autosave: false, schedulePublish: false },
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [rejectChineseOnPublish, rememberPublishedSlug],
    afterChange: [slugRedirectHook('/case-studies'), refresh],
    afterDelete: [refreshAfterDelete],
  },
  fields: [
    {
      type: 'collapsible',
      label: '基本信息',
      fields: [
        { name: 'title', type: 'text', label: '案例标题', required: true, admin: { description: at(`${D}主标题、案例列表、首页精选案例`) } },
        {
          type: 'row',
          fields: [
            {
              name: 'country',
              type: 'select',
              label: '国家 / 地区',
              options: getCountries().map((c) => ({ label: c.name, value: c.code })),
              admin: { width: '50%', description: at('案例卡片和项目概况') },
            },
            { name: 'capacity', type: 'text', label: '产能（kg/h）', admin: { width: '50%', description: at(`${D} › 项目概况 › Capacity`, '只填数字或范围，如 300 或 300–500') } },
          ],
        },
        imageField({ name: 'coverImage', label: '封面图', location: '案例列表卡片、首页精选案例', hint: '默认 4:3（Q21）' }),
        { name: 'summary', type: 'textarea', label: '项目简介', admin: { description: at('首页案例卡片、产品详情的客户案例块', '建议 160 个字符以内') } },
      ],
    },
    slugField('title', '网址 /case-studies/{网址短名}/'),
    {
      type: 'collapsible',
      label: '客户信息',
      admin: { initCollapsed: true },
      fields: [
        { name: 'customerName', type: 'text', label: '客户名称', admin: { description: at(`${D} › 项目概况 › Customer`) } },
        { name: 'showCustomerName', type: 'checkbox', label: '在前台显示客户名称', defaultValue: false, admin: { description: '按客户允许公开的范围勾选' } },
      ],
    },
    {
      type: 'collapsible',
      label: '项目概况',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'products',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          label: '使用的生产线',
          admin: { description: at('案例卡片的 Equipment、案例详情的 Production Lines Used') },
        },
        { name: 'equipmentConfiguration', type: 'textarea', label: '设备配置', admin: { description: at(`${D} › 项目概况 › Equipment Configuration`) } },
        {
          name: 'deliveryDate',
          type: 'date',
          label: '交付日期',
          admin: { date: { pickerAppearance: 'monthOnly', displayFormat: 'yyyy-MM' }, description: at(`${D} › 项目概况 › Delivery Date`, '前台显示为 “March 2025”') },
        },
      ],
    },
    {
      type: 'collapsible',
      label: '正文',
      admin: { initCollapsed: true },
      fields: [
        { name: 'customerRequirements', type: 'richText', label: '客户需求', admin: { description: at(`${D} › Customer Requirements`) } },
        { name: 'solution', type: 'richText', label: '设备方案', admin: { description: at(`${D} › Equipment Solution`) } },
        { name: 'deliveryOperation', type: 'richText', label: '交付与运行', admin: { description: at(`${D} › Delivery & Operation`) } },
      ],
    },
    {
      type: 'collapsible',
      label: '媒体',
      admin: { initCollapsed: true },
      fields: [
        imageField({ name: 'heroImage', label: '详情页主图', location: `${D}顶部`, hint: '不填时用封面图' }),
        {
          name: 'gallery',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          label: '现场图片',
          filterOptions: { mimeType: { contains: 'image' } },
          admin: { description: at(`${D} › Project Photos`, '可点击放大') },
        },
        { name: 'videoUrl', type: 'text', label: 'YouTube 链接', validate: validateYoutubeUrl, admin: { description: at(`${D} › Project Video；首页精选案例`, '为空时首页和详情显示封面图（Q17）') } },
        imageField({ name: 'videoCover', label: '视频封面', location: '首页精选案例、案例视频', hint: '16:9；不填时用 YouTube 缩略图' }),
      ],
    },
    {
      type: 'collapsible',
      label: '模块文案覆盖',
      admin: { initCollapsed: true },
      fields: [
        overrideGroup('sectionTexts', '本案例的标签和按钮', UI_CASE_DETAIL, '只在本案例与默认文案不同时填写；不填时使用“界面文案 › 案例详情”的文字'),
      ],
    },
    seoGroup('本案例'),
  ],
}
