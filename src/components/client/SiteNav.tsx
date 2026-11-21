'use client'

import Link from 'next/link'
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { LocateAttrs } from '@/lib/locator'

type Item = { href: string; label: string; locate?: LocateAttrs }
type ProductGroup = Item & { products: Item[] }

function positionDropdown(anchor: HTMLElement | null) {
  if (!anchor) return
  const viewport = document.documentElement.clientWidth
  const gutter = 12
  const width = Number.parseFloat(getComputedStyle(anchor).getPropertyValue('--product-menu-width'))
  const left = anchor.getBoundingClientRect().left
  const offset = Math.max(gutter - left, Math.min(0, viewport - width - gutter - left))
  anchor.style.setProperty('--product-menu-left', `${offset}px`)
}

export function SiteNav({
  items,
  productGroups,
  texts,
  menuLocate,
}: {
  items: Item[]
  productGroups: ProductGroup[]
  texts: { menu: string; menuOpen: string; menuClose: string; mainNav: string }
  menuLocate?: LocateAttrs
}) {
  const pathname = usePathname() || '/'
  const segment = useSelectedLayoutSegment()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)

  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
    setExpanded(false)
    setHovered(false)
  }
  const dropdownOpen = hovered || expanded

  useEffect(() => {
    if (!dropdownOpen) return
    const reposition = () => positionDropdown(trigger.current?.parentElement ?? null)
    window.addEventListener('resize', reposition)
    return () => window.removeEventListener('resize', reposition)
  }, [dropdownOpen])

  function closeDropdown() {
    setExpanded(false)
    setHovered(false)
  }

  const isCurrent = (href: string) => segment === (href.split('/')[1] || null)

  return (
    <>
      <button
        type="button"
        className="lp-menu"
        aria-expanded={open}
        aria-controls="lp-main-nav"
        aria-label={open ? texts.menuClose : texts.menuOpen}
        onClick={() => { setOpen((value) => !value); closeDropdown() }}
        {...menuLocate}
      >
        {texts.menu}
      </button>
      <nav id="lp-main-nav" className={`lp-nav${open ? ' is-open' : ''}`} aria-label={texts.mainNav}>
        <ul>
          {items.map((item) => {
            const link = (
              <Link href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined} {...item.locate}>
                {item.label}
              </Link>
            )
            if (item.href !== '/products/' || !productGroups.length) return <li key={item.href}>{link}</li>

            return (
              <li
                className="lp-nav-products"
                key={item.href}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse' && matchMedia('(min-width: 768px)').matches) {
                    positionDropdown(event.currentTarget)
                    setHovered(true)
                  }
                }}
                onPointerLeave={() => setHovered(false)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) closeDropdown()
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && dropdownOpen) {
                    event.preventDefault()
                    closeDropdown()
                    trigger.current?.focus()
                  }
                }}
              >
                {link}
                <button
                  ref={trigger}
                  type="button"
                  className="lp-nav-products__toggle"
                  aria-label={`${item.label} – categories`}
                  aria-controls="lp-product-navigation"
                  aria-expanded={dropdownOpen}
                  onClick={(event) => {
                    if (expanded) closeDropdown()
                    else {
                      positionDropdown(event.currentTarget.parentElement)
                      setExpanded(true)
                    }
                  }}
                >
                  <span aria-hidden="true">▾</span>
                </button>
                <div id="lp-product-navigation" className="lp-nav-products__panel" hidden={!dropdownOpen}>
                  {productGroups.map((group) => (
                    <div className="lp-nav-products__group" key={group.href}>
                      <a href={group.href} onClick={() => { closeDropdown(); setOpen(false) }}>
                        <span>{group.label}</span>
                        <span aria-hidden="true">→</span>
                      </a>
                      {group.products.length ? (
                        <ul>
                          {group.products.map((product) => (
                            <li key={product.href}>
                              <Link href={product.href} onClick={() => { closeDropdown(); setOpen(false) }}>{product.label}</Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
