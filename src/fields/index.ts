// 可复用的字段定义。字段名用稳定的英文业务键，后台显示中文（技术方案 3.1）
import type { ArrayField, CheckboxField, Field, GroupField, RowField, TextField, Validate } from 'payload'

import {
  IMAGE_FITS,
  IMAGE_RATIOS,
  SECTION_BACKGROUNDS,
  type SectionBackground,
} from '@/lib/constants'

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
        admin: { description: at(location, hint), width: '50%' },
      },
      ...(documents
        ? []
        : ([
            {
              name: `${name}Ratio`,
              type: 'select',
              label: '图框比例',
              options: [...IMAGE_RATIOS],
              defaultValue: 'default',
              admin: { width: '25%', description: at(location, '“按用途默认”取主题里的默认比例') },
            },
            {
              name: `${name}Fit`,
              type: 'select',
              label: '适配方式',
              options: [...IMAGE_FITS],
              defaultValue: 'default',
              admin: { width: '25%', description: at(location) },
            },
          ] satisfies Field[])),
    ],
  }
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

export function seoGroup(location: string): GroupField {
  return {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    admin: { description: `${location}的搜索标题和分享信息；不填时自动使用标题和简介` },
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
        admin: { description: at(`${location}分享到社交平台时的预览图`, '尺寸 1200×630；不填时用全站默认分享图') },
      },
      {
        name: 'noindex',
        type: 'checkbox',
        label: '禁止搜索引擎收录',
        defaultValue: false,
      },
    ],
  }
}

type SectionOption = { label: string; value: string }

// 模块顺序：每行一个模块，可拖动排序、勾选显示、选择背景（技术方案 5.2）
export function sectionsField(
  options: readonly SectionOption[],
  location: string,
  defaultBackgrounds: Partial<Record<string, SectionBackground>> = {},
): ArrayField {
  return {
    name: 'sections',
    type: 'array',
    label: '模块顺序',
    labels: { singular: '模块', plural: '模块' },
    minRows: options.length,
    maxRows: options.length,
    defaultValue: options.map((option) => ({
      module: option.value,
      visible: true,
      background: defaultBackgrounds[option.value] ?? 'default',
    })),
    admin: {
      description: at(location, '拖动调整模块顺序；取消“显示”后整个模块在前台隐藏；模块没有内容时也会自动隐藏'),
      initCollapsed: true,
      components: { RowLabel: '@/admin/components/RowLabel#SectionRowLabel' },
    },
    validate: (value) => {
      const rows = (value ?? []) as { module?: string }[]
      const modules = rows.map((row) => row.module)
      const missing = options.filter((option) => !modules.includes(option.value))
      if (missing.length) return `缺少模块：${missing.map((m) => m.label).join('、')}`
      if (new Set(modules).size !== modules.length) return '每个模块只能出现一次'
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
            options: options.map((option) => ({ ...option })),
            admin: { width: '40%' },
          },
          { name: 'visible', type: 'checkbox', label: '显示', defaultValue: true, admin: { width: '20%' } },
          {
            name: 'background',
            type: 'select',
            label: '背景',
            options: [...SECTION_BACKGROUNDS],
            defaultValue: 'default',
            admin: { width: '40%' },
          },
        ],
      },
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
