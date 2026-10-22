// 后台左侧菜单和后台首页卡片共用的顺序（技术方案 5.1）
// Payload 自带的分组固定先排全部集合、再排全部全局配置，分组按第一次出现的位置排序，
// 这样“全站设置”（全是全局配置）只能排在“系统”（含用户集合）后面，“辅助页面”（集合）也会排在首页等全局配置前面

// 条目顺序；分组顺序由各组第一个条目的位置决定
const ORDER = [
  'globals:home-page',
  'globals:about-page',
  'globals:products-page',
  'globals:cases-page',
  'globals:contact-page',
  'collections:pages',
  'collections:products',
  'collections:cases',
  'collections:media',
  'collections:inquiries',
  'globals:site-settings',
  'globals:theme',
  'globals:ui-texts',
  'collections:users',
  'collections:redirects',
  'collections:backups',
]

// type 是 'collections' 或 'globals'。没列出的（插件新增的集合等）排在最后；数组排序是稳定的，它们之间保持原顺序
export function navRank(type: string, slug: string): number {
  const index = ORDER.indexOf(`${type}:${slug}`)
  return index < 0 ? ORDER.length : index
}
