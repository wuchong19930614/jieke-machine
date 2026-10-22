// 提交成功页（Q14、技术方案 4.1、7.3）：不收录；加载时推送一次 generate_lead
import type { Metadata } from 'next'
import Link from 'next/link'

import { auxAttrs, AuxBody, auxTitle } from '@/components/AuxPage'
import { ThankYouTracker } from '@/components/client/ThankYouTracker'
import { Section } from '@/components/Section'
import { getAuxPage, getSettings, getUiTexts, isDraft } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import { getLocator } from '@/lib/locator'
import { buildMetadata } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'

const SLUG = 'thank-you' as const
const U = globalDoc('ui-texts')

export async function generateMetadata(): Promise<Metadata> {
  const draft = await isDraft()
  const [page, settings] = await Promise.all([getAuxPage(SLUG, draft), getSettings(draft)])
  return buildMetadata({ settings, path: `/${SLUG}/`, pageName: auxTitle(SLUG, page), seo: page?.seo, noindex: true })
}

export default async function ThankYouPage() {
  const draft = await isDraft()
  const [page, settings, ui, L] = await Promise.all([getAuxPage(SLUG, draft), getSettings(draft), getUiTexts(draft), getLocator()])
  const t = ui.thankYou
  return (
    <Section>
      <div className="lp-message-page">
        {t.kicker ? (
          <div className="lp-kicker" {...L(U, 'thankYou.kicker')}>
            {t.kicker}
          </div>
        ) : null}
        <h1 {...auxAttrs(SLUG, page, L, 'title')}>{auxTitle(SLUG, page)}</h1>
        <div className="lp-steps">
          <AuxBody slug={SLUG} page={page} L={L} />
        </div>
        <p className="lp-muted" {...L(U, 'thankYou.confirmation')}>
          {t.confirmation}
        </p>
        {settings.whatsapp && t.whatsappHint ? (
          <p {...L(U, 'thankYou.whatsappHint')}>
            {t.whatsappHint}{' '}
            <a
              href={whatsappLink(settings.whatsapp, settings.whatsappTexts.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-link"
              data-track="click_whatsapp"
              data-track-location="thank_you"
            >
              {t.whatsappButton}
              <span className="sr-only"> {ui.common.opensNewTab}</span>
            </a>
          </p>
        ) : null}
        {t.backHome || t.exploreProducts ? (
          <div className="lp-actions">
            {t.backHome ? (
              <Link href="/" className="lp-action" {...L(U, 'thankYou.backHome')}>
                {t.backHome}
              </Link>
            ) : null}
            {t.exploreProducts ? (
              <Link href="/products/" className="lp-outline" {...L(U, 'thankYou.exploreProducts')}>
                {t.exploreProducts}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
      <ThankYouTracker />
    </Section>
  )
}
