// 隐私政策（正文按 docs/隐私政策与Cookie说明模板（含巴西LGPD）.md 在后台录入）
import type { Metadata } from 'next'

import { auxAttrs, AuxBody, auxTextStyles, auxTitle } from '@/components/AuxPage'
import { Breadcrumbs, crumbHome, PageBanner, Section } from '@/components/Section'
import { getAuxPage, getSettings, getUiTexts, isDraft } from '@/lib/data'
import { getLocator } from '@/lib/locator'
import { buildMetadata } from '@/lib/seo'

const SLUG = 'privacy-policy' as const

export async function generateMetadata(): Promise<Metadata> {
  const draft = await isDraft()
  const [page, settings] = await Promise.all([getAuxPage(SLUG, draft), getSettings(draft)])
  return buildMetadata({ settings, path: `/${SLUG}/`, pageName: auxTitle(SLUG, page), seo: page?.seo })
}

export default async function PrivacyPolicyPage() {
  const draft = await isDraft()
  const [page, ui, L] = await Promise.all([getAuxPage(SLUG, draft), getUiTexts(draft), getLocator()])
  const textStyles = auxTextStyles(page)
  const title = auxTitle(SLUG, page)
  return (
    <>
      {textStyles}
      <PageBanner
        breadcrumb={<Breadcrumbs label={ui.common.breadcrumb} items={[crumbHome(ui.common.home, L), { text: title, attrs: auxAttrs(SLUG, page, L, 'title') }]} />}
        title={{ text: title, attrs: auxAttrs(SLUG, page, L, 'title') }}
      />
      <Section>
        <div className="lp-article">
          <AuxBody slug={SLUG} page={page} L={L} />
        </div>
      </Section>
    </>
  )
}
