// “点击跳转”设置（fields 里的 linkField）→ 前台链接
import Link from 'next/link'
import React from 'react'

export type LinkValue =
  | { type?: string | null; product?: unknown; caseStudy?: unknown; page?: string | null; url?: string | null; newTab?: boolean | null }
  | null
  | undefined

export type ResolvedLink = { href: string; newTab: boolean }

// 选中的产品 / 案例的网址短名；没发布（草稿或已撤下）时返回 null，避免公开页面链到 404。
// 规则与 lib/data.ts 的 isVisibleDoc 一致：预览（draft）里都可见，公开页面只认已发布的
const slugOf = (doc: unknown, draft: boolean): string | null => {
  if (!doc || typeof doc !== 'object') return null
  const { slug, _status } = doc as { slug?: unknown; _status?: unknown }
  if (typeof slug !== 'string' || (!draft && _status !== 'published')) return null
  return slug
}

// 选“默认”、没填完整或目标没发布时返回 null，由调用处决定不跳转还是进详情页
export function linkHref(link: LinkValue, draft: boolean): ResolvedLink | null {
  if (!link) return null
  let href: string | null = null
  if (link.type === 'product') {
    const slug = slugOf(link.product, draft)
    href = slug ? `/products/${slug}/` : null
  } else if (link.type === 'caseStudy') {
    const slug = slugOf(link.caseStudy, draft)
    href = slug ? `/case-studies/${slug}/` : null
  }
  else if (link.type === 'page') href = link.page || null
  else if (link.type === 'custom') href = link.url?.trim() || null
  return href ? { href, newTab: Boolean(link.newTab) } : null
}

// 有链接时包一层；本站路径用 next/link，外部网址、邮件、电话和新窗口用普通 <a>
export function LinkTo({ link, className, children, label }: { link: ResolvedLink | null; className?: string; children?: React.ReactNode; label?: string }) {
  if (!link) return <>{children}</>
  const internal = link.href.startsWith('/') && !link.href.startsWith('//')
  if (link.newTab || !internal) {
    return (
      <a href={link.href} className={className} aria-label={label} {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  }
  return (
    <Link href={link.href} className={className} aria-label={label}>
      {children}
    </Link>
  )
}
