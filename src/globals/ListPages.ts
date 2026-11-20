// 产品列表页、案例列表页、联系我们（技术方案 3.3）
import { textFields } from '@/content/defineTexts'
import { CASES_PAGE_TEXTS, CONTACT_PAGE_TEXTS, PRODUCTS_PAGE_TEXTS } from '@/content/texts'
import { at, imageField, ratioFitFields, seoGroup } from '@/fields'
import { PATHS } from '@/hooks/revalidate'
import { CASES_PER_PAGE_DEFAULT } from '@/lib/constants'

import { editableGlobal } from './helpers'

export const ProductsPage = editableGlobal({
  slug: 'products-page',
  editViews: { livePreview: { Component: '@/admin/components/FittedLivePreview#FittedLivePreview' } },
  label: '产品列表页',
  group: '页面管理',
  refresh: [PATHS.productList],
  description: '列表按产品归属分区，每组沿用“产品管理”里的拖拽顺序',
  fields: [
    ...textFields(PRODUCTS_PAGE_TEXTS, '产品列表 › 页头', { styled: true }),
    {
      type: 'collapsible',
      label: '列表图片设置',
      admin: { description: '一行一个产品，卡片高度随图片和文字调整。这里可以统一设置图片的比例、宽度和位置；每个产品点图片跳到哪里在“产品管理 › 基本信息 › 点击列表图跳转”里设置' },
      fields: [
        {
          type: 'row',
          fields: ratioFitFields('listImage', '产品列表 › 每个产品的列表图（单个产品另选了比例时以产品为准）'),
        },
        {
          type: 'row',
          fields: [
            {
              name: 'listImageWidth',
              type: 'select',
              label: '图片占一行的宽度',
              defaultValue: 'default',
              options: [
                { label: '标准（约 52%，原型默认）', value: 'default' },
                { label: '40%', value: '40' },
                { label: '50%', value: '50' },
                { label: '60%', value: '60' },
              ],
              admin: { width: '50%', description: at('产品列表 › 电脑和平板上图片的宽度', '手机上图片始终在上方占满一行') },
            },
            {
              name: 'listImagePosition',
              type: 'select',
              label: '图片位置',
              defaultValue: 'alternate',
              options: [
                { label: '左右交替（原型默认）', value: 'alternate' },
                { label: '全部在左边', value: 'left' },
                { label: '全部在右边', value: 'right' },
              ],
              admin: { width: '50%', description: at('产品列表 › 电脑和平板上图片在左边还是右边') },
            },
          ],
        },
      ],
    },
    seoGroup('产品列表页'),
  ],
})

export const CasesPage = editableGlobal({
  slug: 'cases-page',
  label: '案例列表页',
  group: '页面管理',
  refresh: [PATHS.caseList, PATHS.casePages],
  description: '列表按“案例管理”里拖动的顺序显示全部已发布案例，超过每页数量自动分页',
  fields: [
    ...textFields(CASES_PAGE_TEXTS, '案例列表', { styled: true }),
    {
      name: 'perPage',
      type: 'number',
      label: '每页数量',
      defaultValue: CASES_PER_PAGE_DEFAULT,
      min: 3,
      max: 30,
      admin: { description: at('案例列表 › 每页显示的案例数，超过自动分页', '默认 9 个（桌面 3 列）') },
    },
    seoGroup('案例列表页'),
  ],
})

export const ContactPage = editableGlobal({
  slug: 'contact-page',
  label: '联系我们',
  group: '页面管理',
  refresh: [PATHS.contact],
  description: '联系方式自动取“全站设置”，这里只改标题、简介、配图和标签文字',
  fields: [
    ...textFields(CONTACT_PAGE_TEXTS, '联系我们', { styled: true }),
    imageField({ name: 'image', label: '配图', location: '联系我们 › 联系方式下方' }),
    seoGroup('联系我们'),
  ],
})
