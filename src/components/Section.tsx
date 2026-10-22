// 页面模块的外壳、标题和面包屑
import Link from 'next/link'
import React from 'react'

import { globalDoc } from '@/lib/locate'
import type { LocateAttrs, Locator } from '@/lib/locator'

const BG: Record<string, string> = { default: '', light: 'lp-bg-light', dark: 'lp-bg-dark', blue: 'lp-bg-blue' }

export function Section({
  background = 'default',
  className,
  id,
  children,
  attrs,
}: {
  background?: string | null
  className?: string
  id?: string
  children: React.ReactNode
  attrs?: LocateAttrs
}) {
  return (
    <section id={id} className={['lp-section', BG[background ?? 'default'] ?? '', className].filter(Boolean).join(' ')} {...attrs}>
      {children}
    </section>
  )
}

type Line = { text?: string | null; attrs?: LocateAttrs }

// 小标题、标题、副标题各自可能被隐藏，只输出有文字的部分；三项都没有时整块不输出
export function SectionTitle({ kicker, title, subtitle, as = 'h2' }: { kicker?: Line; title: Line; subtitle?: Line; as?: 'h1' | 'h2' }) {
  if (!kicker?.text && !title.text && !subtitle?.text) return null
  const Heading = as
  return (
    <div className="lp-title">
      {kicker?.text ? (
        <div className="lp-kicker" {...kicker.attrs}>
          {kicker.text}
        </div>
      ) : null}
      {title.text ? <Heading {...title.attrs}>{title.text}</Heading> : null}
      {subtitle?.text ? <p {...subtitle.attrs}>{subtitle.text}</p> : null}
    </div>
  )
}

export type Crumb = { href?: string; text: string; attrs?: LocateAttrs }

export function Breadcrumbs({ label, items }: { label: string; items: Crumb[] }) {
  return (
    <nav className="lp-breadcrumb" aria-label={label}>
      <ol>
        {items.map((item, i) => (
          <li key={`${item.text}-${i}`}>
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} {...item.attrs}>
                {item.text}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined} {...item.attrs}>
                {item.text}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// 面包屑前两级（首页、栏目）的定位：首页文字在界面文案，栏目名在全站设置的导航
export function crumbHome(text: string, L: Locator): Crumb {
  return { href: '/', text, attrs: L(globalDoc('ui-texts'), 'common.home') }
}

export function crumbNav(href: string, text: string, key: 'about' | 'products' | 'cases' | 'contact', L: Locator): Crumb {
  return { href, text, attrs: L(globalDoc('site-settings'), `navLabels.${key}`) }
}

export function PageBanner({
  breadcrumb,
  title,
  subtitle,
  children,
}: {
  breadcrumb: React.ReactNode
  title: Line
  subtitle?: Line
  children?: React.ReactNode
}) {
  return (
    <div className="lp-page-banner">
      {breadcrumb}
      <h1 {...title.attrs}>{title.text}</h1>
      {subtitle?.text ? (
        <p className="lp-muted" {...subtitle.attrs}>
          {subtitle.text}
        </p>
      ) : null}
      {children}
    </div>
  )
}

// 按后台“模块顺序”排列模块：没勾选显示的不渲染；后台没有配置时按默认顺序
export function orderedSections<K extends string>(
  sections: { module?: string | null; visible?: boolean | null; background?: string | null }[] | null | undefined,
  defaults: readonly { value: K }[],
  // 从未保存过模块顺序时，背景与后台字段的默认值一致
  backgrounds: Partial<Record<K, string>> = {},
): { module: K; background: string }[] {
  const list = sections?.length ? sections : defaults.map((d) => ({ module: d.value, visible: true, background: backgrounds[d.value] ?? 'default' }))
  const known = new Set<string>(defaults.map((d) => d.value))
  return list
    .filter((s) => s.module && known.has(s.module) && s.visible !== false)
    .map((s) => ({ module: s.module as K, background: s.background || 'default' }))
}

export const sectionIndex = (sections: { module?: string | null }[] | null | undefined, module: string): number =>
  Math.max(0, sections?.findIndex((s) => s.module === module) ?? 0)
