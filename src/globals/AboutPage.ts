// 关于我们（技术方案 3.3）
import { textFields } from '@/content/defineTexts'
import { ABOUT_BANNER_TEXTS, ABOUT_CAPABILITIES_TEXTS, ABOUT_INTRO_TEXTS, ABOUT_SCENES_TEXTS } from '@/content/texts'
import { at, imageField, sectionsField, seoGroup, titleRowLabel } from '@/fields'
import { PATHS } from '@/hooks/revalidate'
import { ABOUT_SECTION_DEFAULT_BACKGROUND, ABOUT_SECTIONS } from '@/lib/constants'

import { editableGlobal } from './helpers'

const A = '关于我们'

export const AboutPage = editableGlobal({
  slug: 'about-page',
  label: '关于我们',
  group: '页面管理',
  refresh: [PATHS.about],
  fields: [
    { name: 'banner', type: 'group', label: '页头', fields: textFields(ABOUT_BANNER_TEXTS, `${A} › 页头`) },
    sectionsField(ABOUT_SECTIONS, A, ABOUT_SECTION_DEFAULT_BACKGROUND),
    {
      name: 'intro',
      type: 'group',
      label: '公司介绍',
      fields: [
        ...textFields(ABOUT_INTRO_TEXTS, `${A} › 公司介绍`),
        { name: 'body', type: 'richText', label: '正文', admin: { description: at(`${A} › 公司介绍 › 正文`) } },
        imageField({ name: 'image', label: '公司或工厂图', location: `${A} › 公司介绍右侧` }),
      ],
    },
    {
      name: 'scenes',
      type: 'group',
      label: '生产场景与团队',
      fields: [
        ...textFields(ABOUT_SCENES_TEXTS, `${A} › 生产场景与团队`),
        {
          name: 'items',
          type: 'array',
          label: '场景',
          labels: { singular: '场景', plural: '场景' },
          admin: { components: { RowLabel: titleRowLabel('title') } },
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', label: '图片', filterOptions: { mimeType: { contains: 'image' } } },
            { name: 'title', type: 'text', label: '标题', required: true },
            { name: 'description', type: 'textarea', label: '说明' },
          ],
        },
      ],
    },
    {
      name: 'capabilities',
      type: 'group',
      label: '供应能力与服务支持',
      fields: [
        ...textFields(ABOUT_CAPABILITIES_TEXTS, `${A} › 供应能力与服务支持`),
        {
          name: 'items',
          type: 'array',
          label: '条目',
          labels: { singular: '条目', plural: '条目' },
          admin: { components: { RowLabel: titleRowLabel('title') } },
          defaultValue: [{ title: 'Equipment Selection' }, { title: 'Custom Configuration' }, { title: 'After-Sales Support' }],
          fields: [
            { name: 'title', type: 'text', label: '标题', required: true },
            { name: 'description', type: 'textarea', label: '说明' },
          ],
        },
      ],
    },
    seoGroup(A),
  ],
})
