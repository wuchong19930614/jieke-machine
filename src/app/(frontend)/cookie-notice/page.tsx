// Cookie 说明（正文按 docs/隐私政策与Cookie说明模板（含巴西LGPD）.md 在后台录入）
import type { Metadata } from 'next'

import { AuxBody, auxTitle } from '@/components/AuxPage'
import { Breadcrumbs, PageBanner, Section } from '@/components/Section'
import { getAuxPage, getSettings, getUiTexts, isDraft } from '@/lib/data'
import { collectionDoc } from '@/lib/locate'
import { getLocator } from '@/lib/locator'
import { buildMetadata } from '@/lib/seo'

const SLUG = 'cookie-notice' as const

export async function generateMetadata(): Promise<Metadata> {
  const draft = await isDraft()
  const [page, settings] = await Promise.all([getAuxPage(SLUG, draft), getSettings(draft)])
  return buildMetadata({ settings, path: `/${SLUG}/`, pageName: auxTitle(SLUG, page), seo: page?.seo })
}

export default async function CookieNoticePage() {
  const draft = await isDraft()
  const [page, ui, L] = await Promise.all([getAuxPage(SLUG, draft), getUiTexts(draft), getLocator()])
  const title = auxTitle(SLUG, page)
  return (
    <>
      <PageBanner
        breadcrumb={<Breadcrumbs label={ui.common.breadcrumb} items={[{ href: '/', text: ui.common.home }, { text: title }]} />}
        title={{ text: title, attrs: page ? L(collectionDoc('pages', page.id), 'title') : {} }}
      />
      <Section>
        <div className="lp-article">
          <AuxBody slug={SLUG} page={page} L={L} />
        </div>
      </Section>
    </>
  )
}
