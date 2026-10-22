// 产品列表页、案例列表页、联系我们（技术方案 3.3）
import { textFields } from '@/content/defineTexts'
import { CASES_PAGE_TEXTS, CONTACT_PAGE_TEXTS, PRODUCTS_PAGE_TEXTS } from '@/content/texts'
import { at, imageField, seoGroup } from '@/fields'
import { PATHS } from '@/hooks/revalidate'
import { CASES_PER_PAGE_DEFAULT } from '@/lib/constants'

import { editableGlobal } from './helpers'

export const ProductsPage = editableGlobal({
  slug: 'products-page',
  label: '产品列表页',
  group: '页面管理',
  refresh: [PATHS.productList],
  description: '列表按“产品管理”里拖动的顺序显示全部已发布产品',
  fields: [...textFields(PRODUCTS_PAGE_TEXTS, '产品列表 › 页头'), seoGroup('产品列表页')],
})

export const CasesPage = editableGlobal({
  slug: 'cases-page',
  label: '案例列表页',
  group: '页面管理',
  refresh: [PATHS.caseList, PATHS.casePages],
  description: '列表按“案例管理”里拖动的顺序显示全部已发布案例，超过每页数量自动分页',
  fields: [
    ...textFields(CASES_PAGE_TEXTS, '案例列表'),
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
    ...textFields(CONTACT_PAGE_TEXTS, '联系我们'),
    imageField({ name: 'image', label: '配图', location: '联系我们 › 联系方式下方' }),
    seoGroup('联系我们'),
  ],
})
