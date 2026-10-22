// 案例列表页面主体：第 1 页和第 n 页共用（技术方案 4.1、4.4）
import Link from 'next/link'

import { CaseCard } from '@/components/CaseCard'
import { Breadcrumbs, crumbHome, crumbNav, PageBanner, Section, SectionTitle } from '@/components/Section'
import { fill, withDefaults } from '@/content/defineTexts'
import { CASES_PAGE_TEXTS } from '@/content/texts'
import { CASES_PER_PAGE_DEFAULT } from '@/lib/constants'
import { getCases, getCasesPage, getSettings, getTheme, getUiTexts, isDraft } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import { getLocator } from '@/lib/locator'
import { breadcrumbJsonLd, JsonLd } from '@/lib/seo'
import { defaultRatio } from '@/lib/theme'

const G = globalDoc('cases-page')
const U = globalDoc('ui-texts')

export const pageHref = (n: number) => (n <= 1 ? '/case-studies/' : `/case-studies/page/${n}/`)

export async function caseListMeta(draft: boolean) {
  const [page, settings, ui] = await Promise.all([getCasesPage(draft), getSettings(draft), getUiTexts(draft)])
  return { page, settings, ui, texts: withDefaults(CASES_PAGE_TEXTS, page) }
}

export async function CaseList({ pageNumber }: { pageNumber: number }) {
  const draft = await isDraft()
  const [{ page, settings, ui, texts }, theme, L] = await Promise.all([caseListMeta(draft), getTheme(draft), getLocator()])
  const perPage = page.perPage || CASES_PER_PAGE_DEFAULT
  const { docs, totalPages } = await getCases(draft, pageNumber, perPage)
  const t = ui.caseList

  return (
    <>
      <PageBanner
        breadcrumb={<Breadcrumbs label={ui.common.breadcrumb} items={[crumbHome(ui.common.home, L), crumbNav('/case-studies/', settings.nav.cases, 'cases', L)]} />}
        title={{ text: texts.title, attrs: L(G, 'title') }}
        subtitle={{ text: texts.subtitle, attrs: L(G, 'subtitle') }}
      />
      <Section>
        {docs.length ? (
          <>
            <SectionTitle title={{ text: texts.listTitle, attrs: L(G, 'listTitle') }} subtitle={{ text: texts.listSubtitle, attrs: L(G, 'listSubtitle') }} />
            <div className="lp-grid3">
              {docs.map((item) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  L={L}
                  buttonText={t.viewCase}
                  buttonAttrs={L(U, 'caseList.viewCase')}
                  ratio={defaultRatio(theme, 'case')}
                  variant="list"
                  labels={{ country: t.countryLabel, equipment: t.equipmentLabel }}
                  draft={draft}
                />
              ))}
            </div>
            {totalPages > 1 ? (
              <nav className="lp-pagination" aria-label={t.pagination}>
                <ul>
                  <li>
                    {pageNumber > 1 ? (
                      <Link href={pageHref(pageNumber - 1)} rel="prev" {...L(U, 'caseList.previous')}>
                        {t.previous}
                      </Link>
                    ) : (
                      <span className="is-disabled" aria-disabled="true" {...L(U, 'caseList.previous')}>
                        {t.previous}
                      </span>
                    )}
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <li key={n}>
                      <Link href={pageHref(n)} aria-current={n === pageNumber ? 'page' : undefined} aria-label={fill(t.pageAria, { n })}>
                        {n}
                      </Link>
                    </li>
                  ))}
                  <li>
                    {pageNumber < totalPages ? (
                      <Link href={pageHref(pageNumber + 1)} rel="next" {...L(U, 'caseList.next')}>
                        {t.next}
                      </Link>
                    ) : (
                      <span className="is-disabled" aria-disabled="true" {...L(U, 'caseList.next')}>
                        {t.next}
                      </span>
                    )}
                  </li>
                </ul>
                <p className="lp-muted" style={{ textAlign: 'center' }} {...L(U, 'caseList.pageOf')}>
                  {fill(t.pageOf, { n: pageNumber, total: totalPages })}
                </p>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="lp-empty">
            <p {...L(U, 'caseList.emptyText')}>{t.emptyText}</p>
            <Link href="/contact/" className="lp-action" {...L(U, 'caseList.emptyButton')}>
              {t.emptyButton}
            </Link>
          </div>
        )}
      </Section>
      <JsonLd data={breadcrumbJsonLd([{ name: ui.common.home, path: '/' }, { name: settings.nav.cases, path: '/case-studies/' }])} />
    </>
  )
}

export async function casePageCount(draft: boolean): Promise<number> {
  const page = await getCasesPage(draft)
  const { totalPages } = await getCases(draft, 1, page.perPage || CASES_PER_PAGE_DEFAULT)
  return totalPages
}
