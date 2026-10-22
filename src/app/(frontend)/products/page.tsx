// 产品列表（技术方案 3.3、4.4）：按后台拖动的顺序显示全部已发布产品
import type { Metadata } from 'next'
import Link from 'next/link'

import { ProductLineCard } from '@/components/ProductLineCard'
import { Breadcrumbs, crumbHome, crumbNav, PageBanner, Section } from '@/components/Section'
import { withDefaults } from '@/content/defineTexts'
import { PRODUCTS_PAGE_TEXTS } from '@/content/texts'
import { getProducts, getProductsPage, getSettings, getTheme, getUiTexts, isDraft } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import { getLocator } from '@/lib/locator'
import { breadcrumbJsonLd, buildMetadata, JsonLd } from '@/lib/seo'
import { defaultRatio } from '@/lib/theme'

const G = globalDoc('products-page')
const U = globalDoc('ui-texts')

export async function generateMetadata(): Promise<Metadata> {
  const draft = await isDraft()
  const [settings, page] = await Promise.all([getSettings(draft), getProductsPage(draft)])
  const texts = withDefaults(PRODUCTS_PAGE_TEXTS, page)
  return buildMetadata({ settings, path: '/products/', pageName: texts.title, description: texts.intro, seo: page.seo })
}

export default async function ProductsListPage() {
  const draft = await isDraft()
  const [page, products, settings, ui, theme, L] = await Promise.all([
    getProductsPage(draft),
    getProducts(draft),
    getSettings(draft),
    getUiTexts(draft),
    getTheme(draft),
    getLocator(),
  ])
  const texts = withDefaults(PRODUCTS_PAGE_TEXTS, page)
  return (
    <>
      <PageBanner
        breadcrumb={<Breadcrumbs label={ui.common.breadcrumb} items={[crumbHome(ui.common.home, L), crumbNav('/products/', settings.nav.products, 'products', L)]} />}
        title={{ text: texts.title, attrs: L(G, 'title') }}
        subtitle={{ text: texts.subtitle, attrs: L(G, 'subtitle') }}
      >
        {texts.intro ? (
          <p style={{ maxWidth: 820, whiteSpace: 'pre-line' }} {...L(G, 'intro')}>
            {texts.intro}
          </p>
        ) : null}
      </PageBanner>
      {products.length ? (
        <Section background="blue" className="lp-store-lines">
          {products.map((product, index) => (
            <ProductLineCard
              key={product.id}
              product={product}
              index={index}
              buttonText={ui.productList.viewDetails}
              buttonAttrs={L(U, 'productList.viewDetails')}
              L={L}
              ratio={defaultRatio(theme, 'equipment')}
            />
          ))}
        </Section>
      ) : (
        <Section>
          <div className="lp-empty">
            <p {...L(U, 'productList.emptyText')}>{ui.productList.emptyText}</p>
            <Link href="/contact/" className="lp-action" {...L(U, 'productList.emptyButton')}>
              {ui.productList.emptyButton}
            </Link>
          </div>
        </Section>
      )}
      <JsonLd data={breadcrumbJsonLd([{ name: ui.common.home, path: '/' }, { name: settings.nav.products, path: '/products/' }])} />
    </>
  )
}
