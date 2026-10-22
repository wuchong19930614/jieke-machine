// 后台首页的集合卡片（技术方案 5.1）：用 Payload 自带的卡片组件生成，再按左侧菜单的顺序重排分组和卡片（顺序见 src/admin/navOrder.ts）。
// 卡片的样式、锁定提示和“新建”按钮都沿用自带组件。按 @payloadcms/ui 3.91.0 的卡片结构重排，
// 升级 Payload 后结构认不出来时原样显示自带的顺序，不会报错
import { CollectionCards } from '@payloadcms/next/rsc'
import type { WidgetServerProps } from 'payload'
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

import { navRank } from '@/admin/navOrder'

type Node = ReactElement<{ children?: ReactNode; href?: string }>

const childrenOf = (node: unknown): Node[] =>
  isValidElement(node) ? ([] as ReactNode[]).concat((node as Node).props.children).filter((child): child is Node => isValidElement(child)) : []

// 每张卡片是 <li><Card href="/admin/collections/pages/" /></li>，从链接里取类型和 slug（项目开启了结尾斜杠，链接带 /）
function cardRank(item: Node): number | null {
  const href = childrenOf(item)[0]?.props.href
  const match = typeof href === 'string' ? /\/(collections|globals)\/([^/?#]+)\/?$/.exec(href) : null
  return match ? navRank(match[1], match[2]) : null
}

export async function DashboardCards(props: WidgetServerProps) {
  // 结构：div.collections > div.collections__wrap > 每组 div.collections__group > [h2 分组名, ul 卡片列表 > li]
  const tree = await CollectionCards(props)
  const [wrap] = childrenOf(tree)
  const groups = childrenOf(wrap).map((group) => {
    const [label, list] = childrenOf(group)
    return { group, label, list, items: childrenOf(list).map((item) => ({ item, rank: cardRank(item) })) }
  })
  const recognized = groups.length > 0 && groups.every(({ label, list, items }) => label && list && items.length && items.every(({ rank }) => rank !== null))
  if (!wrap || !recognized) return tree

  // 数组排序是稳定的，同一位置的条目保持原顺序；元素沿用原来的 key
  const sorted = groups
    .map((g) => ({ ...g, items: [...g.items].sort((a, b) => a.rank! - b.rank!) }))
    .sort((a, b) => a.items[0].rank! - b.items[0].rank!)
  return cloneElement(
    tree,
    undefined,
    cloneElement(
      wrap,
      undefined,
      sorted.map(({ group, label, list, items }) => cloneElement(group, undefined, label, cloneElement(list, undefined, items.map(({ item }) => item)))),
    ),
  )
}
