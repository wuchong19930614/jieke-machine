// 产品列表（技术方案 3.3、4.4）：按后台拖动的顺序显示全部已发布产品
import type { Metadata } from 'next'
import Link from 'next/link'

import { ProductCategoryNav } from '@/components/client/ProductCategoryNav'
import { pickRatio } from '@/components/Img'
import { ProductLineCard } from '@/components/ProductLineCard'
import { Breadcrumbs, crumbHome, crumbNav, PageBanner, Section } from '@/components/Section'
import { StandaloneMachineCard } from '@/components/StandaloneMachineCard'
import { withDefaults } from '@/content/defineTexts'
import { PRODUCTS_PAGE_TEXTS } from '@/content/texts'
import { getProducts, getProductsPage, getSettings, getTheme, getUiTexts, isDraft } from '@/lib/data'
import { collectionDoc, globalDoc } from '@/lib/locate'
import { getLocator, textStyleSheet } from '@/lib/locator'
import { groupProducts } from '@/lib/productCategories'
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
  // 文字样式要在生成页面内容之前登记（见 lib/locator.ts）
  const textStyles = textStyleSheet(G, page)
  const productStyles = products.map((item) => textStyleSheet(collectionDoc('products', item.id), item))
  return (
    <>
      {textStyles}
      {productStyles}
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
      <Section>
        <ProductCategoryNav
          label={settings.nav.products}
          empty={
            <div className="lp-empty">
              <p {...L(U, 'productList.emptyText')}>{ui.productList.emptyText}</p>
              <Link href="/contact/" className="lp-action" {...L(U, 'productList.emptyButton')}>
                {ui.productList.emptyButton}
              </Link>
            </div>
          }
          groups={groupProducts(products).map(({ value, label, products: entries }) => ({
            value,
            label,
            content: entries.length ? entries.map((product, index) => value === 'standalone-machine' ? (
              <StandaloneMachineCard
                key={product.id}
                product={product}
                detailsText={ui.productList.viewDetails}
                detailsAttrs={L(U, 'productList.viewDetails')}
                whatsapp={settings.whatsapp}
                whatsappTexts={settings.whatsappTexts}
                L={L}
                draft={draft}
              />
            ) : (
              <ProductLineCard
                key={product.id}
                product={product}
                index={index}
                headingLevel="h2"
                buttonText={ui.productList.viewDetails}
                buttonAttrs={L(U, 'productList.viewDetails')}
                L={L}
                ratio={defaultRatio(theme, 'equipment')}
                layout={{ ratio: pickRatio(page, 'listImage'), fit: page.listImageFit, width: page.listImageWidth, position: page.listImagePosition ?? 'left' }}
                draft={draft}
              />
            )) : null,
          }))}
        />
      </Section>
      <JsonLd data={breadcrumbJsonLd([{ name: ui.common.home, path: '/' }, { name: settings.nav.products, path: '/products/' }])} />
    </>
  )
}
