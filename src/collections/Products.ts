// 产品（生产线）：一条生产线一条记录，共用同一个详情模板（技术方案 3.4）
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, Field, GroupField } from 'payload'

import { isLoggedIn, recordCreateDeleteAccess, recordEditAccess } from '@/access'
import { overrideGroup } from '@/content/overrideFields'
import { UI_PRODUCT } from '@/content/texts'
import { at, hideField, imageField, linkField, sectionsField, seoGroup, slugField, textStyleField, titleRowLabel, visibleField } from '@/fields'
import { rejectChineseOnPublish } from '@/hooks/publishChecks'
import { PATHS, revalidate } from '@/hooks/revalidate'
import { rememberPublishedSlug, slugRedirectHook } from '@/hooks/slugRedirect'
import { PRODUCT_SECTION_DEFAULT_BACKGROUND, PRODUCT_SECTIONS } from '@/lib/constants'
import { PRODUCT_CATEGORIES } from '@/lib/productCategories'
import { defaultSpecTable, normalizeSpecTable, validateSpecTable } from '@/lib/specTable'
import { validateYoutubeUrl } from '@/lib/youtube'

const D = '产品详情'

// 横幅小标题、报价入口、视频标题、询盘区已有独立字段，覆盖组里不再重复
const OWN_FIELDS = ['heroKicker', 'proposalTitle', 'proposalButton', 'videoTitle', 'inquiryTitle', 'inquiryIntro']
const PRODUCT_OVERRIDES = Object.fromEntries(Object.entries(UI_PRODUCT).filter(([key]) => !OWN_FIELDS.includes(key)))

// 第 15 点：模块文案覆盖的输入框分别放到对应模块分组的最上面（数据仍存 sectionTexts，前台不用改）
type ProductTextKey = keyof typeof UI_PRODUCT
const MODULE_TITLE_KEYS = {
  hero: ['heroButton'],
  applications: ['applicationsTitle', 'applicationsSubtitle', 'applicationsAria'],
  intro: ['introKicker', 'introTitle'],
  features: ['featuresTitle'],
  process: ['processTitle'],
  specs: ['specsTitle', 'specsModel', 'specsSwipe', 'specsEmpty'],
  audience: ['audienceTitle', 'supportTitle'],
  faq: ['faqTitle'],
  advantages: ['advantagesTitle', 'advantagesSubtitle'],
  steps: ['stepsKicker', 'stepsTitle', 'stepsSubtitle', 'stepsAria', 'stepAria'],
  related: ['relatedTitle', 'relatedSubtitle', 'relatedButton'],
  cases: ['casesTitle', 'casesSubtitle', 'casesButton'],
  inquiry: ['inquiryKicker'],
  brochure: ['brochureButton', 'brochureMeta'],
} as const satisfies Record<string, readonly ProductTextKey[]>

// 新增文案键却忘了放进 MODULE_TITLE_KEYS 时：tests/logic.test.ts 会失败提醒；
// 万一漏到线上，这些键留在下面的覆盖组里照常显示（不会没地方改，也不会让整站启动失败）
const placedKeys = new Set<string>(Object.values(MODULE_TITLE_KEYS).flat())
export const UNPLACED_PRODUCT_TEXT_KEYS = Object.keys(PRODUCT_OVERRIDES).filter((key) => !placedKeys.has(key))

// 只隐藏已放进模块分组的字段（含它们的文字样式）；全部放好时整组隐藏
const hiddenGroup = (group: GroupField): GroupField => {
  const isPlaced = (name: string) => placedKeys.has(name.replace(/Style$/, ''))
  const allPlaced = group.fields.every((field) => 'name' in field && isPlaced(field.name))
  return {
    ...group,
    label: allPlaced ? group.label : '其他文字（还没放进对应模块的标题和按钮）',
    admin: { ...group.admin, hidden: allPlaced },
    fields: group.fields.map((field) => ('name' in field && isPlaced(field.name) ? ({ ...field, admin: { ...field.admin, hidden: true } } as Field) : field)),
  }
}

// 标题、小标题、副标题、按钮可以单独设文字样式；朗读名、参数表格子文字等不设
const STYLED_PRODUCT_KEYS = Object.keys(PRODUCT_OVERRIDES).filter((key) => /(Title|Subtitle|Kicker|Button)$/.test(key))

const moduleTitles = (module: keyof typeof MODULE_TITLE_KEYS): Field => {
  const keys: readonly ProductTextKey[] = MODULE_TITLE_KEYS[module]
  return {
    name: `${module}Titles`,
    type: 'ui',
    admin: {
      components: {
        Field: {
          path: '@/admin/components/ModuleTitles#ModuleTitles',
          clientProps: {
            items: keys.map((key) => ({ key, label: UI_PRODUCT[key][0].replace(/^.*：/, ''), placeholder: UI_PRODUCT[key][1], styled: STYLED_PRODUCT_KEYS.includes(key) })),
          },
        },
      },
      // 前台点选这些标题时，定位到这里（见 admin/components/LocateProvider.tsx）
      custom: { locateAliases: keys.flatMap((key) => [`sectionTexts.${key}`, `sectionTexts.${key}Style`]) },
    },
  }
}

// 案例列表的卡片也显示所用生产线的名称，产品改名或下架时一起刷新
const refresh: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (doc?._status === 'published' || previousDoc?._status === 'published') {
    revalidate(req, [
      PATHS.everything,
      PATHS.sitemap,
    ])
  }
  return doc
}

const refreshAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidate(req, [PATHS.everything, PATHS.sitemap])
  return doc
}

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: '产品', plural: '产品管理' },
  orderable: true,
  admin: {
    group: '产品管理',
    components: { views: { edit: { livePreview: { Component: '@/admin/components/FittedLivePreview#FittedLivePreview' } } } },
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
              admin: { width: '50%', description: at('不在前台显示', '只在后台显示，方便识别') },
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
              admin: { width: '50%', description: at('不在页面上显示，写进产品结构化数据（sku）', '询盘会自动带入产品名称和编号') },
            },
            {
              name: 'category',
              type: 'select',
              label: '产品归属',
              defaultValue: 'production-lines',
              options: PRODUCT_CATEGORIES.map(({ value, adminLabel: label }) => ({ value, label })),
              admin: { width: '50%', description: at('产品导航和产品列表', '首页只展示有列表图的生产线') },
            },
          ],
        },
        textStyleField('name', '英文名称'),
        imageField({ name: 'listImage', label: '列表图', location: '首页生产线、产品列表、相关生产线卡片', hint: '首页横滑大图建议 1920×800 px；产品列表和相关生产线卡片建议将设备主体居中。' }),
        linkField({ name: 'listLink', label: '点击列表图跳转', location: '首页生产线、产品列表里点击列表图时打开的页面', defaultLabel: '本产品详情页（默认）' }),
        {
          name: 'listSummary',
          type: 'textarea',
          label: '列表简介',
          admin: { description: at('首页生产线、产品列表卡片里的简介', '建议 160 个字符以内') },
        },
        textStyleField('listSummary', '列表简介'),
      ],
    },
    slugField('name', '网址 /products/{网址短名}/'),
    sectionsField(PRODUCT_SECTIONS, D, PRODUCT_SECTION_DEFAULT_BACKGROUND),
    {
      type: 'collapsible',
      label: '1 横幅与简介',
      admin: { initCollapsed: true },
      fields: [
        moduleTitles('hero'),
        imageField({ name: 'heroImage', label: '横幅图', location: `${D} › 横幅`, hint: '整条生产线或设备场景图' }),
        {
          type: 'row',
          fields: [
            { name: 'heroKicker', type: 'text', label: '小标题', admin: { width: '75%', description: at(`${D} › 横幅 › 小标题`), placeholder: UI_PRODUCT.heroKicker[1] } },
            hideField('heroKicker', '小标题'),
          ],
        },
        textStyleField('heroKicker', '小标题'),
        { name: 'heroSummary', type: 'textarea', label: '简介', admin: { description: at(`${D} › 横幅 › 简介`) } },
        textStyleField('heroSummary', '横幅简介'),
      ],
    },
    {
      type: 'collapsible',
      label: '2 可生产成品',
      admin: { initCollapsed: true },
      fields: [
        moduleTitles('applications'),
        {
          name: 'applications',
          type: 'array',
          label: '成品列表',
          labels: { singular: '成品', plural: '成品' },
          admin: { description: at(`${D} › 可生产成品`, '成品图 1:1，只展示图片和名称'), components: { RowLabel: titleRowLabel('name') } },
          fields: [
            imageField({ name: 'image', label: '成品图', location: `${D} › 可生产成品 › 成品图`, hint: '建议 900×900 px，主体靠中间。' }),
            { name: 'name', type: 'text', label: '成品名称', required: true, admin: { width: '50%' } },
            textStyleField('name', '成品名称'),
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
        moduleTitles('intro'),
        { name: 'introduction', type: 'richText', label: '产品介绍正文', admin: { description: at(`${D} › Product Introduction`) } },
        imageField({ name: 'overviewImage', label: '全景图', location: `${D} › Product Introduction › 全景图`, hint: '可点击放大' }),
      ],
    },
    {
      type: 'collapsible',
      label: '4 设备特点与报价入口',
      admin: { initCollapsed: true },
      fields: [
        moduleTitles('features'),
        { name: 'features', type: 'richText', label: '设备特点', admin: { description: at(`${D} › Equipment Features`) } },
        {
          type: 'row',
          fields: [
            { name: 'proposalTitle', type: 'text', label: '报价入口标题', admin: { width: '75%', description: at(`${D} › 报价入口 › 标题`), placeholder: UI_PRODUCT.proposalTitle[1] } },
            hideField('proposalTitle', '报价入口标题'),
          ],
        },
        textStyleField('proposalTitle', '报价入口标题'),
        { name: 'proposalText', type: 'textarea', label: '报价入口说明', admin: { description: at(`${D} › 报价入口 › 说明`) } },
        textStyleField('proposalText', '报价入口说明'),
        {
          type: 'row',
          fields: [
            { name: 'proposalButtonText', type: 'text', label: '报价按钮文字', admin: { width: '75%', description: at(`${D} › 报价入口 › 按钮`, '点击后滚动到页底询盘表单'), placeholder: UI_PRODUCT.proposalButton[1] } },
            hideField('proposalButtonText', '报价按钮'),
          ],
        },
        textStyleField('proposalButtonText', '报价按钮', { opacity: false }),
      ],
    },
    {
      type: 'collapsible',
      label: '5 工艺流程',
      admin: { initCollapsed: true },
      fields: [
        moduleTitles('process'),
        { name: 'processText', type: 'richText', label: '工艺流程说明', admin: { description: at(`${D} › Production Process`) } },
        imageField({ name: 'flowImage', label: '流程图', location: `${D} › Production Process › 流程图`, hint: '默认保持原图比例，可点击放大' }),
      ],
    },
    {
      type: 'collapsible',
      label: '6 参数表',
      admin: { initCollapsed: true },
      fields: [
        moduleTitles('specs'),
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
        moduleTitles('audience'),
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
        moduleTitles('faq'),
        {
          name: 'faqs',
          type: 'array',
          label: '常见问题',
          labels: { singular: '问题', plural: '问题' },
          admin: { description: at(`${D} › Frequently Asked Questions`), components: { RowLabel: titleRowLabel('question') } },
          fields: [
            { name: 'question', type: 'text', label: '问题', required: true },
            { name: 'answer', type: 'textarea', label: '答案', required: true },
            textStyleField('question', '问题'),
            textStyleField('answer', '答案'),
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
        { name: 'videoUrl', type: 'text', label: 'YouTube 视频链接', validate: validateYoutubeUrl, admin: { description: at(`${D} › Production Line Video`), components: { afterInput: ['@/admin/components/YouTubePreview#YouTubePreview'] } } },
        {
          type: 'row',
          fields: [{ name: 'videoTitle', type: 'text', label: '视频标题', admin: { width: '75%', description: at(`${D} › 视频标题`), placeholder: UI_PRODUCT.videoTitle[1] } }, hideField('videoTitle', '视频标题')],
        },
        textStyleField('videoTitle', '视频标题'),
        imageField({ name: 'videoCover', label: '视频封面图片（选填）', location: `${D} › 视频封面`, hint: '只能放图片，16:9；不填时用 YouTube 缩略图' }),
      ],
    },
    {
      type: 'collapsible',
      label: '10 设备优势',
      admin: { initCollapsed: true },
      fields: [
        moduleTitles('advantages'),
        {
          name: 'advantages',
          type: 'array',
          label: '设备优势',
          labels: { singular: '优势', plural: '优势' },
          admin: { description: at(`${D} › Equipment Advantages`, '编号 01、02… 按显示顺序自动生成'), components: { RowLabel: titleRowLabel('title') } },
          fields: [
            { name: 'title', type: 'text', label: '优势标题', required: true },
            { name: 'description', type: 'textarea', label: '说明' },
            textStyleField('title', '优势标题'),
            textStyleField('description', '说明'),
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
        moduleTitles('steps'),
        {
          name: 'processSteps',
          type: 'array',
          label: '工艺步骤',
          labels: { singular: '步骤', plural: '步骤' },
          admin: { description: at(`${D} › Step-by-Step Process`, '步骤名称和数量按实际设备设置'), components: { RowLabel: titleRowLabel('title') } },
          fields: [
            { name: 'title', type: 'text', label: '步骤名称', required: true },
            textStyleField('title', '步骤名称'),
            imageField({ name: 'image', label: '对应设备图', location: `${D} › Step-by-Step Process › 设备图` }),
            { name: 'description', type: 'textarea', label: '说明' },
            textStyleField('description', '步骤说明'),
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
        moduleTitles('related'),
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
        moduleTitles('cases'),
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
        moduleTitles('inquiry'),
        {
          type: 'row',
          fields: [
            { name: 'formTitle', type: 'text', label: '表单标题', admin: { width: '75%', description: at(`${D} › 询盘区 › 标题`), placeholder: UI_PRODUCT.inquiryTitle[1] } },
            hideField('formTitle', '表单标题'),
          ],
        },
        textStyleField('formTitle', '表单标题'),
        textStyleField('formIntro', '表单说明'),
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
        moduleTitles('brochure'),
        imageField({
          name: 'brochure',
          label: '产品手册 PDF',
          location: `${D} › 页面顶部横幅里“Get a Quote”旁的 Download Brochure 按钮`,
          hint: '上传了 PDF 才显示；打开实时预览后点“在前台定位”可直接滚到这个按钮',
          documents: true,
        }),
        {
          name: 'brochureInSpecs',
          type: 'checkbox',
          label: '参数表下方也显示下载入口',
          defaultValue: true,
          admin: { description: at(`${D} › Technical Specifications 下方`, '客户看完参数顺手就能下载；没上传 PDF 时不显示') },
        },
      ],
    },
    // 输入框已放到各模块分组里（moduleTitles），这里只保留数据，后台不再单独显示
    hiddenGroup(overrideGroup('sectionTexts', '本产品的模块标题和按钮', PRODUCT_OVERRIDES, '', `本产品的${D}页`, STYLED_PRODUCT_KEYS)),
    seoGroup('本产品'),
  ],
}
