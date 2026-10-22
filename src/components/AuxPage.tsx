// 辅助页面正文：后台有已发布内容时用后台的，没有时用默认段落（英文界面文案第十五、十六章）
import type { Metadata } from 'next'
import React from 'react'

import { hasRichText, RichText } from '@/components/RichText'
import { AUX_PAGES } from '@/collections/Pages'
import { PAGE_DEFAULTS, type AuxPageSlug } from '@/content/texts'
import { getAuxPage, getSettings } from '@/lib/data'
import { collectionDoc, newDoc } from '@/lib/locate'
import type { LocateAttrs, Locator } from '@/lib/locator'
import { templateTitle } from '@/lib/seo'
import type { Page } from '@/payload-types'

export function auxTitle(slug: AuxPageSlug, page: Page | null): string {
  return page?.title || PAGE_DEFAULTS[slug].title
}

// 浏览器标签里的页面名：感谢页、404 页用固定的短名（Thank You、Page Not Found），其余用页面标题
export function auxPageName(slug: AuxPageSlug, page: Page | null): string {
  const defaults = PAGE_DEFAULTS[slug]
  return 'pageName' in defaults ? defaults.pageName : auxTitle(slug, page)
}

// 404 页的标题，如 “Page Not Found | 公司名”；后台填了 SEO 标题时优先用它。
// 产品、案例找不到和兜底路由显示 404 时也要返回它：这些路由自己没有标题，浏览器接管页面后会把标签标题清空
export async function notFoundMetadata(draft: boolean): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSettings(draft), getAuxPage('not-found', draft)])
  return {
    title: { absolute: page?.seo?.seoTitle || templateTitle(settings, auxPageName('not-found', page)) },
    robots: { index: false, follow: true },
  }
}

// 预览里的定位：有记录时定位到记录的字段；还没建记录时显示的是默认文字，点选后打开后台新建页
export function auxAttrs(slug: AuxPageSlug, page: Page | null, L: Locator, field: 'title' | 'content'): LocateAttrs {
  if (page) return L(collectionDoc('pages', page.id), field)
  const attrs = L(newDoc('pages'), field)
  if (!attrs['data-locate']) return attrs
  const name = AUX_PAGES.find((p) => p.value === slug)?.label ?? slug
  return { ...attrs, 'data-locate-label': `辅助页面 › 尚未创建，点击后新建，“页面”选“${name}”` }
}

export function AuxBody({ slug, page, L }: { slug: AuxPageSlug; page: Page | null; L: Locator }): React.ReactNode {
  // 保存过的空编辑器也是一个对象，要按是否真有内容判断，否则默认段落不会回退
  if (hasRichText(page?.content)) return <RichText data={page!.content} attrs={auxAttrs(slug, page, L, 'content')} />
  const paragraphs = PAGE_DEFAULTS[slug].body
  if (!paragraphs.length) return null
  return (
    <div className="lp-rich" {...auxAttrs(slug, page, L, 'content')}>
      {paragraphs.map((text, index) => (text === 'What Happens Next' ? <h3 key={index}>{text}</h3> : <p key={index}>{text}</p>))}
    </div>
  )
}
