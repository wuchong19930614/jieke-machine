// 404 页（英文界面文案 16.1）：标题和正文可在“辅助页面 › 404 页”修改
import type { Metadata } from 'next'
import Link from 'next/link'

import { auxAttrs, AuxBody, auxTitle, notFoundMetadata } from '@/components/AuxPage'
import { Section } from '@/components/Section'
import { getAuxPage, getUiTexts, isDraft } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import { getLocator } from '@/lib/locator'

// 浏览器标签标题套用全站标题模板（英文界面文案第十八章）
export async function generateMetadata(): Promise<Metadata> {
  return notFoundMetadata(await isDraft())
}

const U = globalDoc('ui-texts')

export default async function NotFound() {
  const draft = await isDraft()
  const [page, ui, L] = await Promise.all([getAuxPage('not-found', draft), getUiTexts(draft), getLocator()])
  const t = ui.notFound
  return (
    <Section>
      <div className="lp-message-page">
        <div className="lp-code" aria-hidden="true" {...L(U, 'notFound.code')}>
          {t.code}
        </div>
        <h1 {...auxAttrs('not-found', page, L, 'title')}>{auxTitle('not-found', page)}</h1>
        <AuxBody slug="not-found" page={page} L={L} />
        {t.backHome || t.exploreProducts || t.contactUs ? (
          <div className="lp-actions">
            {t.backHome ? (
              <Link href="/" className="lp-action" {...L(U, 'notFound.backHome')}>
                {t.backHome}
              </Link>
            ) : null}
            {t.exploreProducts ? (
              <Link href="/products/" className="lp-outline" {...L(U, 'notFound.exploreProducts')}>
                {t.exploreProducts}
              </Link>
            ) : null}
            {t.contactUs ? (
              <Link href="/contact/" className="lp-outline" {...L(U, 'notFound.contactUs')}>
                {t.contactUs}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </Section>
  )
}
