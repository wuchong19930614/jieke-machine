// 产品（生产线）：一条生产线一条记录，共用同一个详情模板（技术方案 3.4）
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

import { isLoggedIn, recordCreateDeleteAccess, recordEditAccess } from '@/access'
import { overrideGroup } from '@/content/overrideFields'
import { UI_PRODUCT } from '@/content/texts'
import { at, hideField, imageField, sectionsField, seoGroup, slugField, titleRowLabel, visibleField } from '@/fields'
import { rejectChineseOnPublish } from '@/hooks/publishChecks'
import { PATHS, revalidate } from '@/hooks/revalidate'
import { rememberPublishedSlug, slugRedirectHook } from '@/hooks/slugRedirect'
import { PRODUCT_SECTION_DEFAULT_BACKGROUND, PRODUCT_SECTIONS } from '@/lib/constants'
import { defaultSpecTable, normalizeSpecTable, validateSpecTable } from '@/lib/specTable'
import { validateYoutubeUrl } from '@/lib/youtube'

const D = '产品详情'

// 横幅小标题、报价入口、视频标题、询盘区已有独立字段，覆盖组里不再重复
const OWN_FIELDS = ['heroKicker', 'proposalTitle', 'proposalButton', 'videoTitle', 'inquiryTitle', 'inquiryIntro']
const PRODUCT_OVERRIDES = Object.fromEntries(Object.entries(UI_PRODUCT).filter(([key]) => !OWN_FIELDS.includes(key)))

// 案例列表的卡片也显示所用生产线的名称，产品改名或下架时一起刷新
const refresh: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (doc?._status === 'published' || previousDoc?._status === 'published') {
    revalidate(req, [
      PATHS.home,
      PATHS.productList,
      PATHS.productDetails,
      PATHS.caseList,
      PATHS.casePages,
      PATHS.caseDetails,
      PATHS.contact,
      PATHS.sitemap,
    ])
  }
  return doc
}

const refreshAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidate(req, [PATHS.home, PATHS.productList, PATHS.productDetails, PATHS.caseList, PATHS.casePages, PATHS.caseDetails, PATHS.contact, PATHS.sitemap])
  return doc
}

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: '产品', plural: '产品管理' },
  orderable: true,
  admin: {
    group: '产品管理',
    useAsTitle: 'name',
    defaultColumns: ['name', 'nameZh', 'productCode', '_status', 'updatedAt'],
    listSearchableFields: ['name', 'nameZh', 'productCode', 'slug'],
    description: '列表里拖动可调整产品顺序，前台产品列表按这个顺序显示',
  },
  access: {
    read: isLoggedIn,
    create: recordCreateDeleteAccess(),
    update: recordEditAccess('products'),
    delete: recordCreateDeleteAccess(),
    readVersions: isLoggedIn,
  },
  versions: {
    drafts: { autosave: false, schedulePublish: false },
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data && 'specTable' in data) data.specTable = normalizeSpecTable(data.specTable)
        return data
      },
      rejectChineseOnPublish,
      rememberPublishedSlug,
    ],
    afterChange: [slugRedirectHook('/products'), refresh],
    afterDelete: [refreshAfterDelete],
  },
  fields: [
    {
      type: 'collapsible',
      label: '基本信息',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: '英文名称',
              required: true,
              admin: { width: '50%', description: at('详情页横幅标题、首页生产线、产品列表、相关生产线') },
            },
            {
              name: 'nameZh',
              type: 'text',
              label: '中文名称',
              custom: { allowChinese: true },
              admin: { width: '50%', description: '只在后台显示，方便识别' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'productCode',
              type: 'text',
              label: '产品编号',
              admin: { width: '50%', description: '询盘会自动带入产品名称和编号' },
            },
            {
              name: 'category',
              type: 'select',
              label: '产品归属',
              defaultValue: 'production-lines',
              options: [{ label: 'Production Lines（生产线）', value: 'production-lines' }],
              admin: { width: '50%', description: '首期只有生产线一类，前台不做分类筛选' },
            },
          ],
        },
        imageField({ name: 'listImage', label: '列表图', location: '首页生产线、产品列表、相关生产线卡片', hint: '默认 4:3' }),
        {
          name: 'listSummary',
          type: 'textarea',
          label: '列表简介',
          admin: { description: at('首页生产线、产品列表卡片里的简介', '建议 160 个字符以内') },
        },
      ],
    },
    slugField('name', '网址 /products/{网址短名}/'),
    sectionsField(PRODUCT_SECTIONS, D, PRODUCT_SECTION_DEFAULT_BACKGROUND),
    {
      type: 'collapsible',
      label: '1 横幅与简介',
      admin: { initCollapsed: true },
      fields: [
        imageField({ name: 'heroImage', label: '横幅图', location: `${D} › 横幅`, hint: '整条生产线或设备场景图' }),
        {
          type: 'row',
          fields: [
            { name: 'heroKicker', type: 'text', label: '小标题', admin: { width: '75%', description: at(`${D} › 横幅 › 小标题`), placeholder: UI_PRODUCT.heroKicker[1] } },
            hideField('heroKicker', '小标题'),
          ],
        },
        { name: 'heroSummary', type: 'textarea', label: '简介', admin: { description: at(`${D} › 横幅 › 简介`) } },
      ],
    },
    {
      type: 'collapsible',
      label: '2 可生产成品',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'applications',
          type: 'array',
          label: '成品列表',
          labels: { singular: '成品', plural: '成品' },
          admin: { description: at(`${D} › 可生产成品`, '成品图 1:1，只展示图片和名称'), components: { RowLabel: titleRowLabel('name') } },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', label: '成品图', filterOptions: { mimeType: { contains: 'image' } }, admin: { width: '50%' } },
                { name: 'name', type: 'text', label: '成品名称', required: true, admin: { width: '50%' } },
              ],
            },
            visibleField(),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '3 图文介绍',
      admin: { initCollapsed: true },
      fields: [
        { name: 'introduction', type: 'richText', label: '产品介绍正文', admin: { description: at(`${D} › Product Introduction`) } },
        imageField({ name: 'overviewImage', label: '全景图', location: `${D} › Product Introduction › 全景图`, hint: '可点击放大' }),
      ],
    },
    {
      type: 'collapsible',
      label: '4 设备特点与报价入口',
      admin: { initCollapsed: true },
      fields: [
        { name: 'features', type: 'richText', label: '设备特点', admin: { description: at(`${D} › Equipment Features`) } },
        {
          type: 'row',
          fields: [
            { name: 'proposalTitle', type: 'text', label: '报价入口标题', admin: { width: '75%', description: at(`${D} › 报价入口 › 标题`), placeholder: UI_PRODUCT.proposalTitle[1] } },
            hideField('proposalTitle', '报价入口标题'),
          ],
        },
        { name: 'proposalText', type: 'textarea', label: '报价入口说明', admin: { description: at(`${D} › 报价入口 › 说明`) } },
        {
          type: 'row',
          fields: [
            { name: 'proposalButtonText', type: 'text', label: '报价按钮文字', admin: { width: '75%', description: at(`${D} › 报价入口 › 按钮`, '点击后滚动到页底询盘表单'), placeholder: UI_PRODUCT.proposalButton[1] } },
            hideField('proposalButtonText', '报价按钮'),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '5 工艺流程',
      admin: { initCollapsed: true },
      fields: [
        { name: 'processText', type: 'richText', label: '工艺流程说明', admin: { description: at(`${D} › Production Process`) } },
        imageField({ name: 'flowImage', label: '流程图', location: `${D} › Production Process › 流程图`, hint: '默认保持原图比例，可点击放大' }),
      ],
    },
    {
      type: 'collapsible',
      label: '6 参数表',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'specTable',
          type: 'json',
          label: '参数表',
          defaultValue: defaultSpecTable(),
          validate: (value: unknown) => validateSpecTable(value),
          admin: {
            description: at(`${D} › Technical Specifications`, '每个型号一列；勾选“公开”的行才在前台显示；单位写在参数名里，如 Capacity (kg/h)'),
            components: { Field: '@/admin/components/SpecTableField#SpecTableField' },
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: '7 适用客户与项目支持',
      admin: { initCollapsed: true },
      fields: [
        { name: 'audience', type: 'richText', label: '适用客户', admin: { description: at(`${D} › Who This Line Is For`) } },
        { name: 'projectSupport', type: 'richText', label: '项目支持', admin: { description: at(`${D} › Project Support`, '安装、培训、保修、备件说明') } },
        imageField({ name: 'detailImage', label: '细节或交付现场图', location: `${D} › 适用客户与项目支持下方` }),
      ],
    },
    {
      type: 'collapsible',
      label: '8 FAQ',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'faqs',
          type: 'array',
          label: '常见问题',
          labels: { singular: '问题', plural: '问题' },
          admin: { description: at(`${D} › Frequently Asked Questions`), components: { RowLabel: titleRowLabel('question') } },
          fields: [
            { name: 'question', type: 'text', label: '问题', required: true },
            { name: 'answer', type: 'textarea', label: '答案', required: true },
            visibleField(),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '9 运行视频',
      admin: { initCollapsed: true },
      fields: [
        { name: 'videoUrl', type: 'text', label: 'YouTube 链接', validate: validateYoutubeUrl, admin: { description: at(`${D} › Production Line Video`) } },
        {
          type: 'row',
          fields: [{ name: 'videoTitle', type: 'text', label: '视频标题', admin: { width: '75%', placeholder: UI_PRODUCT.videoTitle[1] } }, hideField('videoTitle', '视频标题')],
        },
        imageField({ name: 'videoCover', label: '视频封面', location: `${D} › 视频封面`, hint: '16:9；不填时用 YouTube 缩略图' }),
      ],
    },
    {
      type: 'collapsible',
      label: '10 设备优势',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'advantages',
          type: 'array',
          label: '设备优势',
          labels: { singular: '优势', plural: '优势' },
          admin: { description: at(`${D} › Equipment Advantages`, '编号 01、02… 按显示顺序自动生成'), components: { RowLabel: titleRowLabel('title') } },
          fields: [
            { name: 'title', type: 'text', label: '优势标题', required: true },
            { name: 'description', type: 'textarea', label: '说明' },
            visibleField(),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '11 工艺步骤切换',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'processSteps',
          type: 'array',
          label: '工艺步骤',
          labels: { singular: '步骤', plural: '步骤' },
          admin: { description: at(`${D} › Step-by-Step Process`, '步骤名称和数量按实际设备设置'), components: { RowLabel: titleRowLabel('title') } },
          fields: [
            { name: 'title', type: 'text', label: '步骤名称', required: true },
            { name: 'image', type: 'upload', relationTo: 'media', label: '对应设备图', filterOptions: { mimeType: { contains: 'image' } } },
            { name: 'description', type: 'textarea', label: '说明' },
            visibleField(),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '12 相关生产线',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'relatedProducts',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          label: '相关生产线',
          filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
          admin: { description: at(`${D} › Related Production Lines`, '选中顺序即显示顺序') },
        },
      ],
    },
    {
      type: 'collapsible',
      label: '13 客户案例',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'relatedCases',
          type: 'relationship',
          relationTo: 'cases',
          hasMany: true,
          label: '客户案例',
          admin: { description: at(`${D} › Customer Stories & Project Cases`) },
        },
      ],
    },
    {
      type: 'collapsible',
      label: '14 询盘表单',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'formTitle', type: 'text', label: '表单标题', admin: { width: '75%', description: at(`${D} › 询盘区 › 标题`), placeholder: UI_PRODUCT.inquiryTitle[1] } },
            hideField('formTitle', '表单标题'),
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'formIntro', type: 'textarea', label: '表单说明', admin: { width: '75%', description: at(`${D} › 询盘区 › 说明`), placeholder: UI_PRODUCT.inquiryIntro[1] } },
            hideField('formIntro', '表单说明'),
          ],
        },
        imageField({ name: 'contactImage', label: '联系区域图片', location: `${D} › 询盘区左侧` }),
      ],
    },
    {
      type: 'collapsible',
      label: '产品手册',
      admin: { initCollapsed: true },
      fields: [
        imageField({ name: 'brochure', label: '产品手册 PDF', location: `${D} › 横幅 › Download Brochure 按钮`, hint: '上传了 PDF 才显示下载按钮（Q24）', documents: true }),
      ],
    },
    {
      type: 'collapsible',
      label: '模块文案覆盖',
      admin: { initCollapsed: true },
      fields: [
        overrideGroup(
          'sectionTexts',
          '本产品的模块标题和按钮',
          PRODUCT_OVERRIDES,
          '只在本产品与默认文案不同时填写；不填时使用“界面文案 › 产品详情模板”的文字',
        ),
      ],
    },
    seoGroup('本产品'),
  ],
}
