'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

export function HeaderLayout({
  flow, style, children,
}: {
  flow: 'inline' | 'reverse' | 'stacked'
  style: CSSProperties
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = ref.current
    if (!header || flow !== 'stacked') return
    const logo = header.querySelector('.lp-logo')
    const nav = header.querySelector('.lp-nav')
    if (!logo || !nav) return

    const update = () => {
      const brand = logo.getBoundingClientRect()
      const menu = nav.getBoundingClientRect()
      const gap = Math.max(menu.left - brand.right, brand.left - menu.right)
      header.toggleAttribute('data-header-fits', menu.width > 0 && gap >= 20)
    }
    const observer = new ResizeObserver(update)
    observer.observe(header)
    observer.observe(logo)
    observer.observe(nav)
    update()
    return () => {
      observer.disconnect()
      header.removeAttribute('data-header-fits')
    }
  }, [flow, style])

  return <header ref={ref} className="lp-header" data-header-flow={flow} style={style}>{children}</header>
}
