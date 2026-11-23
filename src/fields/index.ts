// 可复用的字段定义。字段名用稳定的英文业务键，后台显示中文（技术方案 3.1）
import type { ArrayField, CheckboxField, CollapsibleField, Field, GroupField, RowField, TextField, Validate } from 'payload'

import {
  HEX_COLOR,
  IMAGE_FITS,
  IMAGE_RATIOS,
  IMAGE_SECTION_MODULES,
  isImageSectionModule,
  SECTION_BACKGROUNDS,
  SECTION_DEVICES,
  type SectionBackground,
} from '@/lib/constants'
import { validateTextStyle } from '@/lib/textStyle'

// 字段下方的“前台位置”说明（技术方案 3.1 第 3 条）
export const at = (location: string, extra?: string): string =>
  extra ? `前台位置：${location}。${extra}` : `前台位置：${location}`

type ImageFieldOptions = {
  name: string
  label: string
  location: string
  required?: boolean
  hint?: string
  documents?: boolean
}

const IMAGE_SIZE_HINTS: Record<string, string> = {
  listImage: '1600×1000',
  heroImage: '1920×1080',
  overviewImage: '1600×1000',
  flowImage: '1600×900',
  detailImage: '1200×800',
  coverImage: '1200×800',
  videoCover: '1280×720',
  contactImage: '1000×1200',
}

// 图片位置：媒体引用 + 本位置的图框比例 + 适配方式（技术方案 5.2）
export function imageField({ name, label, location, required, hint, documents }: ImageFieldOptions): RowField {
  return {
    type: 'row',
    fields: [
      {
        name,
        type: 'upload',
        relationTo: 'media',
        label,
        required,
        filterOptions: documents ? { mimeType: { equals: 'application/pdf' } } : { mimeType: { contains: 'image' } },
        admin: {
          description: at(location, documents ? hint : [
            hint,
            hint?.includes(' px') ? null : `建议尺寸：${IMAGE_SIZE_HINTS[name] ?? '1200×900'} px。`,
            '选择「按原图比例」可随上传图片自动调整图框；手动比例优先。',
          ].filter(Boolean).join(' ')),
          width: '50%',
        },
      },
      ...(documents ? [] : ratioFitFields(name, location)),
    ],
  }
}

export function photoGalleryField(location: string, { captionsRequired = false }: { captionsRequired?: boolean } = {}): ArrayField {
  return {
    name: 'photos',
    type: 'array',
    label: '图片与说明',
    labels: { singular: '照片', plural: '照片' },
    maxRows: 16,
    admin: {
      description: at(location, '第一张为首图，拖动可排序。建议使用清晰横图 1600×1000 px；设备细节图可上传竖图 1000×1400 px。前台按数量自动排列，手机端收成单列。'),
      initCollapsed: true,
      components: { RowLabel: titleRowLabel('caption') },
    },
    fields: [
      imageField({ name: 'image', label: '照片', location, required: true, hint: '推荐横图 1600×1000 px 或竖图 1000×1400 px。默认完整显示。' }),
      { name: 'caption', type: 'textarea', label: '这张图的说明', required: captionsRequired, admin: { description: '显示在本图正下方，可说明设备、现场进度或交付情况。' } },
      textStyleField('caption', '图片说明'),
    ],
  }
}

// 自定义比例“宽:高”，允许中文冒号和小数
export const CUSTOM_RATIO = /^\d+(\.\d+)?\s*[:：]\s*\d+(\.\d+)?$/

// 图框比例 + 适配方式两个选择框；多图字段（如案例现场图片）整组共用一套设置
export function ratioFitFields(name: string, location: string, defaultToOriginal = false): Field[] {
  return [
    {
      name: `${name}Ratio`,
      type: 'select',
      label: '图框比例',
      options: IMAGE_RATIOS.map((option) =>
        defaultToOriginal && option.value === 'default' ? { ...option, label: '列表默认（按原图比例）' } : option,
      ),
      defaultValue: 'default',
      admin: { width: '25%', description: at(location, defaultToOriginal ? '默认按原图宽高比显示，选择固定比例可统一图框。' : '“按用途默认”取主题里的默认比例') },
    },
    {
      name: `${name}RatioCustom`,
      type: 'text',
      label: '自定义比例（宽:高）',
      admin: {
        width: '25%',
        placeholder: '如 5:4',
        description: '图框比例选“自定义…”时填写，例如 5:4、21:9',
        condition: (_data, siblingData) => siblingData?.[`${name}Ratio`] === 'custom',
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.[`${name}Ratio`] !== 'custom') return true
        return typeof value === 'string' && CUSTOM_RATIO.test(value.trim()) ? true : '请填写宽:高，例如 5:4'
      },
      // 中文输入法下常打出全角冒号“5：4”：校验前统一换成半角，前台和“发布前不能含中文”的检查都按 5:4 处理
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? value.replace(/：/g, ':').trim() : value)] },
      // 内容只可能是数字和冒号（见上面的校验），不参与“前台不能含中文”的检查，旧数据里残留的“：”也不会拦住发布
      custom: { allowChinese: true },
    } as Field,
    {
      name: `${name}Fit`,
      type: 'select',
      label: '适配方式',
      options: [...IMAGE_FITS],
      defaultValue: 'default',
      admin: { width: '25%', description: at(location) },
    },
  ]
}

export const visibleField = (location = '前台是否显示该条目'): CheckboxField => ({
  name: 'visible',
  type: 'checkbox',
  label: '显示',
  defaultValue: true,
  admin: { description: location },
})

// 带默认文案的字段旁边的“隐藏”勾选（技术方案 5.2“单个字段的显示”）：勾选后前台不显示，文字仍保留
export const hideField = (name: string, label: string): CheckboxField => ({
  name: `${name}Hidden`,
  type: 'checkbox',
  label: `隐藏${label}`,
  defaultValue: false,
  admin: { width: '25%' },
})

export const toSlug = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

// 案例列表分页占用了 /case-studies/page/ 这一级，网址短名不能叫 page
const RESERVED_SLUGS = ['page', 'admin', 'api']

const validateSlug: Validate<string> = (value) => {
  if (!value) return '请填写网址短名'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return '只能使用小写英文字母、数字和连字符'
  if (RESERVED_SLUGS.includes(value)) return `“${value}”是系统保留的网址，请换一个`
  return true
}

export function slugField(source: string, location: string): TextField {
  return {
    name: 'slug',
    type: 'text',
    label: '网址短名',
    unique: true,
    index: true,
    required: true,
    validate: validateSlug,
    admin: {
      position: 'sidebar',
      description: at(location, '留空时按英文名称自动生成；修改后系统自动把旧网址永久跳转到新网址'),
    },
    hooks: {
      beforeValidate: [
        ({ value, siblingData }) => {
          if (typeof value === 'string' && value.trim()) return toSlug(value)
          const fromSource = siblingData?.[source]
          return typeof fromSource === 'string' ? toSlug(fromSource) : value
        },
      ],
    },
  }
}

// SEO 设置不显示在页面上，业务人员常以为“前台没体现”：分组标题写明这一点，默认收起，并在后台直接预览效果
export function seoGroup(location: string, className?: string): CollapsibleField {
  return {
    type: 'collapsible',
    label: '搜索引擎与分享设置（不在页面上显示）',
    admin: { initCollapsed: true, className },
    fields: [seoFields(location)],
  }
}

function seoFields(location: string): GroupField {
  return {
    name: 'seo',
    type: 'group',
    label: 'SEO 设置',
    admin: {
      description: `只影响${location}在三个地方的显示：Google 搜索结果里的标题和摘要、浏览器标签页上的名字、把链接发到 WhatsApp / Facebook 时的预览卡片。不填会自动用页面标题和简介，一般不用改。`,
    },
    fields: [
      { name: 'seoTitle', type: 'text', label: 'SEO 标题', maxLength: 70, admin: { description: at(`${location}的浏览器标签页标题、搜索结果标题`, '建议 60 个字符以内') } },
      {
        name: 'seoDescription',
        type: 'textarea',
        label: 'SEO 描述',
        maxLength: 200,
        admin: { description: at(`${location}在搜索结果和分享预览里的摘要`, '建议 160 个字符以内') },
      },
      {
        name: 'ogImage',
        type: 'upload',
        relationTo: 'media',
        label: '分享预览图',
        filterOptions: { mimeType: { contains: 'image' } },
        admin: { description: at(`${location}分享到社交平台时的预览图`, `尺寸 1200×630；不填时用${location === '本产品' ? '本产品的列表图（没有列表图时用横幅图）' : location === '本案例' ? '本案例的封面图' : '全站默认分享图'}（下方预览会显示实际用哪张）`) },
      },
      {
        name: 'noindex',
        type: 'checkbox',
        label: '禁止搜索引擎收录',
        defaultValue: false,
        admin: { description: '勾选后这一页不会出现在 Google 等搜索结果里' },
      },
      { name: 'seoPreview', type: 'ui', admin: { components: { Field: '@/admin/components/SeoPreview#SeoPreview' } } },
    ],
  }
}

type SectionOption = { label: string; value: string }

// 图片模块 / 图片网格的内容字段（第 1、3 点），只在这两种模块的行里显示
function imageModuleFields(location: string): Field[] {
  const isBanner = (_data: unknown, s: Record<string, unknown>) => s?.module === 'imageBanner'
  const isGrid = (_data: unknown, s: Record<string, unknown>) => s?.module === 'imageGrid'
  const isImage = (_data: unknown, s: Record<string, unknown>) => isImageSectionModule(s?.module)
  const upload = (name: string, label: string, description: string, width = '50%'): Field => ({
    name,
    type: 'upload',
    relationTo: 'media',
    label,
    filterOptions: { mimeType: { contains: 'image' } },
    admin: { width, description },
  })
  const height = (name: string, label: string): Field => ({
    name,
    type: 'number',
    label,
    min: 80,
    max: 1200,
    admin: { width: '33%', placeholder: '按原图比例', description: '单位 px；留空按图片原来的比例显示，填了按高度裁切（以焦点为中心）' },
  })
  return [
    {
      type: 'row',
      admin: { condition: isBanner },
      fields: [
        upload('desktopImage', '电脑图', at(`${location} › 图片模块`, '建议 1920×800 px；替代文字在媒体库里填写（英文，必填）')),
        upload('mobileImage', '手机图（选填）', '建议 1080×1440 px；不填时用电脑图。'),
      ],
    },
    {
      type: 'row',
      admin: { condition: isGrid },
      fields: [
        {
          name: 'columns',
          type: 'select',
          label: '电脑上每行几张',
          defaultValue: '3',
          options: ['2', '3', '4'].map((v) => ({ label: `${v} 张`, value: v })),
          admin: { width: '50%' },
        },
        {
          name: 'mobileColumns',
          type: 'select',
          label: '手机上每行几张',
          defaultValue: '2',
          options: ['1', '2'].map((v) => ({ label: `${v} 张`, value: v })),
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: isImage },
      fields: [
        height('height', '电脑上的高度'),
        height('mobileHeight', '手机上的高度'),
        {
          name: 'imageWidth',
          type: 'select',
          label: '宽度',
          defaultValue: 'content',
          options: [
            { label: '与内容同宽', value: 'content' },
            { label: '铺满整个屏幕', value: 'full' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
    { ...linkField({ location: `${location} › 图片模块 › 点击图片跳转` }), admin: { description: at(`${location} › 图片模块 › 点击图片跳转`), condition: isBanner } } as Field,
    {
      name: 'gridItems',
      type: 'array',
      label: '网格图片',
      labels: { singular: '图片', plural: '图片' },
      admin: { condition: isGrid, description: at(`${location} › 图片网格`, '拖动调整顺序；每张图可以单独设置点击后跳到哪里，适合做产品入口'), initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            upload('image', '电脑图', '替代文字在媒体库里填写（英文，必填）'),
            upload('mobileImage', '手机图（选填）', '不填时用电脑图'),
          ],
        },
        linkField({ location: `${location} › 图片网格 › 点击图片跳转` }),
      ],
    },
  ]
}

// 模块顺序：每行一个模块，可拖动排序、勾选显示、选择背景（技术方案 5.2）。
// imageModules：首页可以另外插入任意多个图片模块 / 图片网格（第 1 点）
export function sectionsField(
  options: readonly SectionOption[],
  location: string,
  defaultBackgrounds: Partial<Record<string, SectionBackground>> = {},
  { imageModules = false }: { imageModules?: boolean } = {},
): ArrayField {
  const moduleOptions = imageModules ? [...options, ...IMAGE_SECTION_MODULES] : options
  return {
    name: 'sections',
    type: 'array',
    label: '模块顺序',
    labels: { singular: '模块', plural: '模块' },
    minRows: options.length,
    ...(imageModules ? {} : { maxRows: options.length }),
    defaultValue: options.map((option) => ({
      module: option.value,
      visible: true,
      background: defaultBackgrounds[option.value] ?? 'default',
    })),
    admin: {
      description: at(
        location,
        imageModules
          ? '拖动调整模块顺序；点下方“添加模块”可插入图片模块或图片网格（可以插多个）；取消“显示”后整个模块在前台隐藏；模块没有内容时也会自动隐藏'
          : '拖动调整模块顺序；取消“显示”后整个模块在前台隐藏；模块没有内容时也会自动隐藏',
      ),
      initCollapsed: true,
      components: { RowLabel: '@/admin/components/RowLabel#SectionRowLabel' },
    },
    validate: (value) => {
      const rows = (value ?? []) as { module?: string }[]
      // 图片模块可以有多个，其余固定模块各出现一次
      const modules = rows.map((row) => row.module).filter((m) => !isImageSectionModule(m))
      const missing = options.filter((option) => !modules.includes(option.value))
      if (missing.length) return `缺少模块：${missing.map((m) => m.label).join('、')}`
      if (new Set(modules).size !== modules.length) return '除图片模块和图片网格外，每个模块只能出现一次'
      if (rows.some((row) => !row.module)) return '有一行还没选择模块类型，请在“模块”里选择，或删除这一行'
      return true
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'module',
            type: 'select',
            label: '模块',
            required: true,
            options: moduleOptions.map((option) => ({ ...option })),
            admin: { width: '30%' },
          },
          { name: 'visible', type: 'checkbox', label: '显示', defaultValue: true, admin: { width: '14%' } },
          {
            name: 'device',
            type: 'select',
            label: '显示在',
            options: [...SECTION_DEVICES],
            defaultValue: 'all',
            admin: { width: '26%', description: '手机指屏幕宽度小于 768px' },
          },
          {
            name: 'background',
            type: 'select',
            label: '背景',
            options: [...SECTION_BACKGROUNDS],
            defaultValue: 'default',
            admin: { width: '30%', description: '深色背景上文字会自动变成白色' },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'backgroundColor',
            type: 'text',
            label: '自定义颜色',
            admin: {
              width: '40%',
              placeholder: '#EAF2FB',
              description: '点左边色块用色盘选，或直接输入色号，例如 #EAF2FB',
              condition: (_data, siblingData) => siblingData?.background === 'custom',
              components: { Field: '@/admin/components/ColorField#ColorField' },
            },
            validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
              if (siblingData?.background !== 'custom') return true
              return typeof value === 'string' && HEX_COLOR.test(value.trim()) ? true : '请填写 # 开头的 6 位色号，例如 #EAF2FB'
            },
          } as Field,
          {
            name: 'backgroundImage',
            type: 'upload',
            relationTo: 'media',
            label: '背景图片（选填）',
            filterOptions: { mimeType: { contains: 'image' } },
            admin: { width: '40%', description: '建议 1920×1080 px。按照模块宽高覆盖，焦点在媒体库设置；可用右边的遮罩调深浅。' },
          },
          {
            name: 'backgroundOverlay',
            type: 'number',
            label: '遮罩深浅（%）',
            min: 0,
            max: 90,
            defaultValue: 40,
            admin: {
              width: '20%',
              step: 5,
              description: '越往右背景图越暗，文字越清楚',
              condition: (_data, siblingData) => Boolean(siblingData?.backgroundImage),
              components: { Field: '@/admin/components/RangeField#RangeField' },
            },
          },
        ],
      },
      ...(imageModules ? imageModuleFields(location) : []),
    ],
  }
}


// 带“前台位置”说明的普通文本，简化各集合里的大量文案字段
export function textField(
  name: string,
  label: string,
  location: string,
  options: Partial<TextField> & { defaultValue?: string; maxLength?: number } = {},
): TextField {
  return {
    name,
    type: 'text',
    label,
    ...options,
    admin: { ...options.admin, description: at(location, options.admin?.description as string | undefined) },
  } as TextField
}

export const titleRowLabel = (field = 'title') => ({
  path: '@/admin/components/RowLabel#TitleRowLabel',
  clientProps: { field },
})

// “点击跳转”设置（第 6、9 点，第三批图片模块也会复用）：选产品 / 案例 / 网站页面 / 自定义网址。
// 前台用 components/LinkTo.tsx 的 linkHref() 解析；选“默认”时由使用的地方决定（不跳转或进详情页）
export const LINK_PAGES = [
  { label: '首页', value: '/' },
  { label: '产品列表', value: '/products/' },
  { label: '案例列表', value: '/case-studies/' },
  { label: '关于我们', value: '/about/' },
  { label: '联系我们', value: '/contact/' },
] as const

// 本站路径必须是单个 / 开头；//域名 是外部地址，容易误填，不接受
const LINK_URL = /^(https?:\/\/\S+|\/(?!\/)\S*|mailto:\S+|tel:\S+)$/

type LinkFieldOptions = { name?: string; label?: string; location: string; defaultLabel?: string }

export function linkField({ name = 'link', label = '点击跳转', location, defaultLabel = '不跳转' }: LinkFieldOptions): GroupField {
  const when = (type: string) => (_data: unknown, siblingData: Record<string, unknown>) => siblingData?.type === type
  const requiredWhen =
    (type: string, message: string) =>
    (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
      siblingData?.type !== type || (value !== null && value !== undefined && value !== '') ? true : message
  return {
    name,
    type: 'group',
    label,
    admin: { description: at(location) },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'select',
            label: '跳到哪里',
            defaultValue: 'default',
            options: [
              { label: defaultLabel, value: 'default' },
              { label: '某个产品', value: 'product' },
              { label: '某个案例', value: 'caseStudy' },
              { label: '网站页面', value: 'page' },
              { label: '自定义网址', value: 'custom' },
            ],
            admin: { width: '30%' },
          },
          {
            name: 'product',
            type: 'relationship',
            relationTo: 'products',
            label: '选择产品',
            admin: { width: '45%', condition: when('product') },
            validate: requiredWhen('product', '请选择要跳转的产品'),
          } as Field,
          {
            name: 'caseStudy',
            type: 'relationship',
            relationTo: 'cases',
            label: '选择案例',
            admin: { width: '45%', condition: when('caseStudy') },
            validate: requiredWhen('caseStudy', '请选择要跳转的案例'),
          } as Field,
          {
            name: 'page',
            type: 'select',
            label: '选择页面',
            options: [...LINK_PAGES],
            admin: { width: '45%', condition: when('page') },
            validate: requiredWhen('page', '请选择要跳转的页面'),
          } as Field,
          {
            name: 'url',
            type: 'text',
            label: '网址',
            admin: { width: '45%', placeholder: 'https://… 或 /products/xxx/', condition: when('custom') },
            validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
              if (siblingData?.type !== 'custom') return true
              return typeof value === 'string' && LINK_URL.test(value.trim()) ? true : '请填写 https:// 开头的完整网址，或 / 开头的本站路径，例如 /contact/'
            },
          } as Field,
          {
            name: 'newTab',
            type: 'checkbox',
            label: '在新窗口打开',
            admin: { width: '25%', condition: (_data, siblingData) => Boolean(siblingData?.type) && siblingData?.type !== 'default' },
          },
        ],
      },
    ],
  }
}

// “文字样式”（第 4、15 点）：字号（电脑 / 手机）、字体、颜色、透明度，存成一个 JSON。
// 后台是可展开的小面板（admin/components/TextStyleField.tsx），不填就跟随主题
export function textStyleField(name: string, label: string, { opacity = true }: { opacity?: boolean } = {}): Field {
  return {
    name: `${name}Style`,
    type: 'json',
    label: `${label}：文字样式`,
    validate: (value: unknown) => validateTextStyle(value),
    admin: {
      components: { Field: { path: '@/admin/components/TextStyleField#TextStyleField', clientProps: { opacity, target: label } } },
    },
  } as Field
}
