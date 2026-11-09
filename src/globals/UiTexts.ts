// 界面文案（技术方案 3.2）：模块标题、按钮、标签、无障碍朗读名等固定文字
import type { Field } from 'payload'

import { textGroup, type TextDefs } from '@/content/defineTexts'
import {
  UI_BANNER,
  UI_CASE_DETAIL,
  UI_CASE_LIST,
  UI_COMMON,
  UI_COOKIE,
  UI_ERROR,
  UI_FOOTER,
  UI_MOBILE,
  UI_NOT_FOUND,
  UI_PAGE_TITLES,
  UI_PRODUCT,
  UI_PRODUCT_LIST,
  UI_THANK_YOU,
  UI_TOPBAR,
} from '@/content/texts'
import { PATHS } from '@/hooks/revalidate'

import { editableGlobal } from './helpers'

const section = (name: string, label: string, location: string, defs: TextDefs): Field => ({
  type: 'collapsible',
  label,
  admin: { initCollapsed: true },
  fields: [textGroup(name, label, location, defs)],
})

export const UiTexts = editableGlobal({
  slug: 'ui-texts',
  label: '界面文案',
  group: '全站设置',
  refresh: [PATHS.everything],
  description: '留空的字段使用默认英文（输入框里的灰色文字）。{companyName} 这类花括号变量由系统自动替换，请保留。',
  fields: [
    section('common', '通用', '全站通用的按钮、提示和无障碍朗读名', UI_COMMON),
    section('topBar', '顶栏', '页面最上方的深色细条', UI_TOPBAR),
    section('footer', '页脚', '页脚', UI_FOOTER),
    section('mobileBar', '手机底部按钮条', '手机底部按钮条（宽度小于 768px 时显示）', UI_MOBILE),
    section('banner', '首页 Banner', '首页 Banner 轮播的按钮和控件', UI_BANNER),
    section('productList', '产品列表', '产品列表页', UI_PRODUCT_LIST),
    section('product', '产品详情模板', '所有产品详情页（单个产品在产品编辑页各模块最上面的“本模块标题和按钮文字”里改）', UI_PRODUCT),
    section('caseList', '案例列表', '案例列表页', UI_CASE_LIST),
    section('caseDetail', '案例详情', '所有案例详情页（单个案例可在“模块文案覆盖”里改）', UI_CASE_DETAIL),
    section('cookie', 'Cookie Settings 弹窗', '页脚 Cookie Settings 打开的弹窗', UI_COOKIE),
    section('thankYou', '感谢页', '/thank-you/ 页面的按钮和提示', UI_THANK_YOU),
    section('notFound', '404 页', '404 页面的按钮', UI_NOT_FOUND),
    section('error', '错误页', '页面出错时显示', UI_ERROR),
    section('pageTitles', '页面标题', '浏览器标签标题', UI_PAGE_TITLES),
  ],
})
