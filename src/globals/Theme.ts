// 主题设置（技术方案 3.2）：只提供设计稿确认过的档位
import { at, textStyleField } from '@/fields'
import { PATHS } from '@/hooks/revalidate'
import { IMAGE_RATIOS } from '@/lib/constants'

import { editableGlobal } from './helpers'

export const PALETTES = {
  'industrial-blue': { label: '工业蓝（原型默认）', dark: '#142e46', ink: '#142b42', muted: '#647587', soft: '#f3f6f9', line: '#dbe3ea', brand: '#3275df', brandInk: '#2164c4' },
  graphite: { label: '石墨灰', dark: '#22272e', ink: '#1f2328', muted: '#656d76', soft: '#f4f5f7', line: '#d8dee4', brand: '#3d5a80', brandInk: '#2f4a6d' },
  'deep-green': { label: '深绿', dark: '#16352c', ink: '#17302a', muted: '#5f7470', soft: '#f2f6f4', line: '#d6e2dd', brand: '#2f7d5b', brandInk: '#23654a' },
} as const

export const QUOTE_COLORS = {
  orange: { label: '标准橙（原型默认）', value: '#e7662b' },
  amber: { label: '亮橙', value: '#f07c1f' },
  rust: { label: '深橙', value: '#cf4f1c' },
} as const

export const FONTS = {
  system: { label: 'Arial（原型默认）' },
  inter: { label: 'Inter' },
  montserrat: { label: 'Montserrat（仅标题）' },
  'open-sans': { label: 'Open Sans（仅正文）' },
} as const

// 主题里的默认比例没有填写宽高的地方，不提供“自定义”
const ratioOptions = IMAGE_RATIOS.filter((r) => r.value !== 'default' && r.value !== 'custom').map((r) => ({ ...r }))

const ratio = (name: string, label: string, defaultValue: string, location: string, hint?: string) => ({
  name,
  type: 'select' as const,
  label,
  options: ratioOptions,
  defaultValue,
  admin: { width: '33%', description: at(location, hint) },
})

export const Theme = editableGlobal({
  slug: 'theme',
  label: '主题',
  group: '全站设置',
  refresh: [PATHS.everything],
  description: '切换配色、字体、字号、间距、文字级别、页面宽度和默认图框比例；悬浮栏红色和在线沟通蓝色按需求书固定',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'palette',
          type: 'select',
          label: '配色',
          defaultValue: 'industrial-blue',
          options: Object.entries(PALETTES).map(([value, p]) => ({ label: p.label, value })),
          admin: { width: '50%', description: at('全站：深色区块、标题与正文文字、浅色底、分隔线、链接和按钮的主色') },
        },
        {
          name: 'quoteButtonColor',
          type: 'select',
          label: '询盘按钮颜色',
          defaultValue: 'orange',
          options: Object.entries(QUOTE_COLORS).map(([value, c]) => ({ label: c.label, value })),
          admin: { width: '50%', description: at('全站：询盘按钮和橙色强调元素') },
        },
      ],
    },
    {
      type: 'collapsible',
      label: '全局字体调整',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'fontWeight',
          type: 'select',
          label: '全站字重',
          defaultValue: 'inherit',
          options: [
            { label: '跟随原样式', value: 'inherit' },
            { label: '常规', value: 'regular' },
            { label: '加粗', value: 'bold' },
          ],
          admin: { description: '单项文字样式和文字级别设置优先。' },
        },
        {
          name: 'fontScale',
          type: 'select',
          label: '全站字号',
          defaultValue: 'standard',
          options: [
            { label: '缩小', value: 'small' },
            { label: '标准', value: 'standard' },
            { label: '放大', value: 'large' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'headingFont',
              type: 'select',
              label: '标题字体',
              defaultValue: 'system',
              options: ['system', 'inter', 'montserrat'].map((value) => ({ label: FONTS[value as keyof typeof FONTS].label, value })),
              admin: { width: '50%', description: at('全站：各级标题') },
            },
            {
              name: 'bodyFont',
              type: 'select',
              label: '正文字体',
              defaultValue: 'system',
              options: ['system', 'inter', 'open-sans'].map((value) => ({ label: FONTS[value as keyof typeof FONTS].label, value })),
              admin: { width: '50%', description: at('全站：正文文字') },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'spacingScale',
          type: 'select',
          label: '间距',
          defaultValue: 'standard',
          options: [
            { label: '紧凑', value: 'compact' },
            { label: '标准', value: 'standard' },
            { label: '宽松', value: 'relaxed' },
          ],
          admin: { width: '50%', description: at('全站：各模块上下留白') },
        },
      ],
    },
    {
      name: 'textLevels',
      type: 'group',
      label: '文字级别',
      admin: {
        description:
          '按文字级别统一设置全站的字号（电脑 / 手机分开）、字体和颜色；不填的项保持现在的样子。某一段标题或按钮需要特别处理时，用它旁边的“文字样式”单独设置，单独设置优先。颜色只用在浅色背景的模块上，深色背景上的文字仍自动为白色',
      },
      fields: [
        textStyleField('pageTitle', '页面大标题', { opacity: false }),
        textStyleField('sectionTitle', '模块标题', { opacity: false }),
        textStyleField('kicker', '小标题', { opacity: false }),
        textStyleField('body', '正文', { opacity: false }),
        textStyleField('button', '按钮', { opacity: false }),
      ],
    },
    {
      type: 'collapsible',
      label: '页面宽度',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'contentWidth',
              type: 'select',
              label: '内容最大宽度',
              defaultValue: '1180',
              options: [
                { label: '标准 1180px（原型默认）', value: '1180' },
                { label: '较宽 1280px', value: '1280' },
                { label: '宽屏 1440px', value: '1440' },
              ],
              admin: { width: '33%', description: at('全站：电脑上内容最宽多少，屏幕更宽时两侧留白') },
            },
            {
              name: 'sideGutter',
              type: 'select',
              label: '电脑端两侧最小留白',
              defaultValue: 'standard',
              options: [
                { label: '标准（屏幕宽度的 5%）', value: 'standard' },
                { label: '较宽（至少 48px）', value: 'wide' },
                { label: '很宽（至少 80px）', value: 'wider' },
              ],
              admin: { width: '33%', description: at('全站：屏幕不够宽时，内容离屏幕边缘至少留多少；手机上固定 5%') },
            },
            {
              name: 'bannerWidth',
              type: 'select',
              label: '首页横幅宽度',
              defaultValue: 'content',
              options: [
                { label: '与内容同宽、两侧留白', value: 'content' },
                { label: '铺满整个屏幕', value: 'full' },
              ],
              admin: { hidden: true },
            },
          ],
        },
      ],
    },
    {
      name: 'defaultRatios',
      type: 'group',
      label: '默认图框比例',
      admin: { description: '按用途的默认比例；单个图片位置可在该位置另行设置' },
      fields: [
        {
          type: 'row',
          fields: [
            ratio('equipment', '设备', 'original', '首页生产线卡片、产品列表、产品详情页的设备图'),
            ratio('factory', '工厂与团队', 'original', '首页工厂图集、关于我们、联系我们的配图'),
            ratio('case', '案例', 'original', '案例列表、案例详情、产品详情页的客户案例卡片'),
          ],
        },
        {
          type: 'row',
          fields: [
            ratio('application', '成品', 'original', '产品详情 › 可生产成品'),
            ratio('videoCover', '视频封面', '16/9', '首页 › 视频模块封面'),
            { ...ratio('banner', 'Banner', 'original', '首页 › Banner'), admin: { hidden: true } },
          ],
        },
      ],
    },
  ],
})
