'use client'
// 给左侧菜单里“当前所在的页面”加上 jk-active，样式见 custom.scss 的“后台整体视觉”一节。
// Payload 自带的判断是 pathname.startsWith(href)：本站网址统一以斜杠结尾，菜单链接是 /admin/collections/products/，
// 而页面路径是 /admin/collections/products，永远对不上，所以原版从来不标当前菜单。这里去掉末尾斜杠再比，
// 并取最长匹配（编辑某个产品时 /admin/collections/products/1 也算“产品管理”）
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const trim = (path: string) => path.replace(/\/+$/, '') || '/'

function mark(pathname: string) {
  const current = trim(pathname)
  const links = [...document.querySelectorAll<HTMLElement>('.nav .nav__link')]
  let best: HTMLElement | null = null
  let bestLength = -1
  for (const link of links) {
    const href = link.getAttribute('href')
    // 当前页在原版里会渲染成没有 href 的 div；它只在路径完全相等时出现，此时按自身 id 已足够判断，跳过即可
    if (!href) continue
    const target = trim(href)
    const matches = current === target || current.startsWith(`${target}/`)
    if (matches && target.length > bestLength) {
      best = link
      bestLength = target.length
    }
  }
  for (const link of links) link.classList.toggle('jk-active', link === best)
}

export function NavActive() {
  const pathname = usePathname()
  useEffect(() => {
    mark(pathname)
    // 展开 / 收起菜单分组时 Payload 会重新渲染链接，重新标一次
    const nav = document.querySelector('.nav')
    if (!nav) return
    const observer = new MutationObserver(() => {
      observer.disconnect()
      mark(pathname)
      observer.observe(nav, { childList: true, subtree: true })
    })
    observer.observe(nav, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [pathname])
  return null
}
