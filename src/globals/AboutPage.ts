// 关于我们（技术方案 3.3）
import type { Field } from 'payload'

import { textFields } from '@/content/defineTexts'
import { ABOUT_BANNER_TEXTS, ABOUT_CAPABILITIES_TEXTS, ABOUT_INTRO_TEXTS, ABOUT_SCENES_TEXTS } from '@/content/texts'
import { at, imageField, linkField, ratioFitFields, sectionsField, seoGroup, textStyleField, titleRowLabel } from '@/fields'
import { PATHS } from '@/hooks/revalidate'
import { ABOUT_SECTION_DEFAULT_BACKGROUND, ABOUT_SECTIONS } from '@/lib/constants'

import { editableGlobal } from './helpers'

const A = '关于我们'

// “生产场景与团队”“供应能力与服务支持”的显示方式（第 6 点）：图文卡片 / 纯图片，每行几张，纯图片时统一的图片比例
function displayFields(label: string): Field[] {
  const location = `${A} › ${label}`
  return [
    {
      type: 'row',
      fields: [
        {
          name: 'display',
          type: 'select',
          label: '显示方式',
          defaultValue: 'cards',
          options: [
            { label: '图文卡片（图片 + 标题 + 说明）', value: 'cards' },
            { label: '纯图片', value: 'images' },
          ],
          admin: { width: '50%', description: at(location, '选“纯图片”后标题和说明可以不填，只显示图片') },
        },
        {
          name: 'columns',
          type: 'select',
          label: '每行几张',
          defaultValue: '3',
          options: [
            { label: '2 张', value: '2' },
            { label: '3 张', value: '3' },
            { label: '4 张', value: '4' },
          ],
          admin: { width: '50%', description: at(location, '平板上最多 2 张，手机上 1 张') },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: (_data, siblingData) => siblingData?.display === 'images' },
      fields: ratioFitFields('images', `${location}（纯图片，所有图片统一；单张图片另选了比例时以单张为准）`),
    },
  ]
}

// 图文卡片方式下标题必填，纯图片方式下选填
const titleRequiredForCards =
  (group: 'scenes' | 'capabilities') =>
  (value: unknown, { data }: { data: Record<string, unknown> }) => {
    const display = (data?.[group] as { display?: string } | undefined)?.display
    if (display === 'images' || (typeof value === 'string' && value.trim())) return true
    return '“图文卡片”方式下标题必填；只想放图片，请把上面的“显示方式”改成“纯图片”'
  }

export const AboutPage = editableGlobal({
  slug: 'about-page',
  label: '关于我们',
  group: '页面管理',
  refresh: [PATHS.about, PATHS.home],
  fields: [
    { name: 'banner', type: 'group', label: '页头', fields: textFields(ABOUT_BANNER_TEXTS, `${A} › 页头`, { styled: true }) },
    sectionsField(ABOUT_SECTIONS, A, ABOUT_SECTION_DEFAULT_BACKGROUND),
    {
      name: 'intro',
      type: 'group',
      label: '公司介绍',
      fields: [
        ...textFields(ABOUT_INTRO_TEXTS, `${A} › 公司介绍`, { styled: true }),
        { name: 'body', type: 'richText', label: '正文', admin: { description: at(`${A} › 公司介绍 › 正文`) } },
        textStyleField('body', '正文'),
        imageField({ name: 'image', label: '公司或工厂图', location: `${A} › 公司介绍右侧` }),
      ],
    },
    {
      name: 'scenes',
      type: 'group',
      label: '生产场景与团队',
      fields: [
        ...textFields(ABOUT_SCENES_TEXTS, `${A} › 生产场景与团队`, { styled: true }),
        ...displayFields('生产场景与团队'),
        {
          name: 'items',
          type: 'array',
          label: '场景',
          labels: { singular: '场景', plural: '场景' },
          admin: { components: { RowLabel: titleRowLabel('title') } },
          fields: [
            imageField({ name: 'image', label: '图片', location: `${A} › 生产场景与团队 › 卡片图片` }),
            {
              name: 'title',
              type: 'text',
              label: '标题（图文卡片时必填）',
              validate: titleRequiredForCards('scenes'),
              admin: { description: at(`${A} › 生产场景与团队 › 卡片标题`, '纯图片方式下作为图片说明文字显示在图片下方，可不填') },
            } as Field,
            { name: 'description', type: 'textarea', label: '说明', admin: { description: at(`${A} › 生产场景与团队 › 卡片说明`, '纯图片方式下不显示') } },
            textStyleField('title', '卡片标题'),
            textStyleField('description', '卡片说明'),
            linkField({ location: `${A} › 生产场景与团队 › 点击图片跳转` }),
          ],
        },
      ],
    },
    {
      name: 'capabilities',
      type: 'group',
      label: '供应能力与服务支持',
      fields: [
        ...textFields(ABOUT_CAPABILITIES_TEXTS, `${A} › 供应能力与服务支持`, { styled: true }),
        ...displayFields('供应能力与服务支持'),
        {
          name: 'items',
          type: 'array',
          label: '条目',
          labels: { singular: '条目', plural: '条目' },
          admin: { components: { RowLabel: titleRowLabel('title') } },
          defaultValue: [{ title: 'Equipment Selection' }, { title: 'Custom Configuration' }, { title: 'After-Sales Support' }],
          fields: [
            imageField({ name: 'image', label: '图片（选填）', location: `${A} › 供应能力与服务支持 › 条目图片`, hint: '图文卡片方式下显示在标题上方；纯图片方式下必须上传' }),
            {
              name: 'title',
              type: 'text',
              label: '标题（图文卡片时必填）',
              validate: titleRequiredForCards('capabilities'),
              admin: { description: at(`${A} › 供应能力与服务支持 › 条目标题`, '纯图片方式下作为图片说明文字显示在图片下方，可不填') },
            } as Field,
            { name: 'description', type: 'textarea', label: '说明', admin: { description: at(`${A} › 供应能力与服务支持 › 条目说明`, '纯图片方式下不显示') } },
            textStyleField('title', '条目标题'),
            textStyleField('description', '条目说明'),
            linkField({ location: `${A} › 供应能力与服务支持 › 点击图片跳转` }),
          ],
        },
      ],
    },
    seoGroup(A),
  ],
})
