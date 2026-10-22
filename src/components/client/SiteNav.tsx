'use client'
// 页头导航：当前栏目高亮；手机端收起为菜单按钮（技术方案 4.2）
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import type { LocateAttrs } from '@/lib/locator'

type Item = { href: string; label: string; locate?: LocateAttrs }

export function SiteNav({
  items,
  texts,
  menuLocate,
}: {
  items: Item[]
  texts: { menu: string; menuOpen: string; menuClose: string; mainNav: string }
  menuLocate?: LocateAttrs
}) {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  // 切换页面后收起手机菜单
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <>
      <button
        type="button"
        className="lp-menu"
        aria-expanded={open}
        aria-controls="lp-main-nav"
        aria-label={open ? texts.menuClose : texts.menuOpen}
        onClick={() => setOpen((v) => !v)}
        {...menuLocate}
      >
        {texts.menu}
      </button>
      <nav id="lp-main-nav" className={`lp-nav${open ? ' is-open' : ''}`} aria-label={texts.mainNav}>
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined} {...item.locate}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
