// 404 页（英文界面文案 16.1）：标题和正文可在“辅助页面 › 404 页”修改
import type { Metadata } from 'next'
import Link from 'next/link'

import { AuxBody, auxTitle } from '@/components/AuxPage'
import { Section } from '@/components/Section'
import { getAuxPage, getUiTexts, isDraft } from '@/lib/data'
import { getLocator } from '@/lib/locator'

export const metadata: Metadata = { title: 'Page Not Found', robots: { index: false, follow: true } }

export default async function NotFound() {
  const draft = await isDraft()
  const [page, ui, L] = await Promise.all([getAuxPage('not-found', draft), getUiTexts(draft), getLocator()])
  const t = ui.notFound
  return (
    <Section>
      <div className="lp-message-page">
        <div className="lp-code" aria-hidden="true">
          {t.code}
        </div>
        <h1>{auxTitle('not-found', page)}</h1>
        <AuxBody slug="not-found" page={page} L={L} />
        {t.backHome || t.exploreProducts || t.contactUs ? (
          <div className="lp-actions">
            {t.backHome ? (
              <Link href="/" className="lp-action">
                {t.backHome}
              </Link>
            ) : null}
            {t.exploreProducts ? (
              <Link href="/products/" className="lp-outline">
                {t.exploreProducts}
              </Link>
            ) : null}
            {t.contactUs ? (
              <Link href="/contact/" className="lp-outline">
                {t.contactUs}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </Section>
  )
}
