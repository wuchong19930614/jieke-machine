// 辅助页面正文：后台有已发布内容时用后台的，没有时用默认段落（英文界面文案第十五、十六章）
import React from 'react'

import { hasRichText, RichText } from '@/components/RichText'
import { PAGE_DEFAULTS, type AuxPageSlug } from '@/content/texts'
import { collectionDoc } from '@/lib/locate'
import type { Locator } from '@/lib/locator'
import type { Page } from '@/payload-types'

export function auxTitle(slug: AuxPageSlug, page: Page | null): string {
  return page?.title || PAGE_DEFAULTS[slug].title
}

export function AuxBody({ slug, page, L }: { slug: AuxPageSlug; page: Page | null; L: Locator }): React.ReactNode {
  // 保存过的空编辑器也是一个对象，要按是否真有内容判断，否则默认段落不会回退
  if (hasRichText(page?.content)) return <RichText data={page!.content} attrs={L(collectionDoc('pages', page!.id), 'content')} />
  const paragraphs = PAGE_DEFAULTS[slug].body
  if (!paragraphs.length) return null
  return (
    <div className="lp-rich">
      {paragraphs.map((text, index) => (text === 'What Happens Next' ? <h3 key={index}>{text}</h3> : <p key={index}>{text}</p>))}
    </div>
  )
}
