// 产品详情（技术方案 3.4、4.4）：14 个模块按本产品的“模块顺序”渲染，没有内容的模块整块不输出
import { Download } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { notFoundMetadata } from '@/components/AuxPage'
import { CaseCard } from '@/components/CaseCard'
import { InquiryForm } from '@/components/client/InquiryForm'
import { ZoomButton } from '@/components/client/Lightbox'
import { ProcessSteps } from '@/components/client/ProcessSteps'
import { VideoEmbed } from '@/components/client/VideoEmbed'
import { CurrentProduct } from '@/components/client/WhatsAppLink'
import { Img, mediaOf, pickRatio } from '@/components/Img'
import { hasRichText, RichText } from '@/components/RichText'
import { backgroundProps, type BackgroundSpec, Breadcrumbs, crumbHome, crumbNav, orderedSections, Section, SectionTitle } from '@/components/Section'
import { SpecTable } from '@/components/SpecTable'
import { fill } from '@/content/defineTexts'
import { overrideTexts } from '@/content/overrideFields'
import { FORM_TEXTS } from '@/content/texts'
import { PRODUCT_SECTION_DEFAULT_BACKGROUND, PRODUCT_SECTIONS, type ProductSectionKey } from '@/lib/constants'
import { getCountries } from '@/lib/countries'
import { getProduct, getSettings, getTheme, getUiTexts, isDraft, isVisibleDoc, publishedSlugs } from '@/lib/data'
import { collectionDoc, globalDoc } from '@/lib/locate'
import { getLocator, locateGroup, textStyleSheet } from '@/lib/locator'
import { redirectOr404 } from '@/lib/redirectOr404'
import { breadcrumbJsonLd, buildMetadata, JsonLd } from '@/lib/seo'
import { siteUrl } from '@/lib/previewPath'
import { defaultRatio } from '@/lib/theme'
import { normalizeSpecTable, publicRows } from '@/lib/specTable'
import { youtubeId } from '@/lib/youtube'
import type { Case, Product } from '@/payload-types'

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = true

export async function generateStaticParams() {
  return (await publishedSlugs('products')).map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const draft = await isDraft()
  const [product, settings] = await Promise.all([getProduct(slug, draft), getSettings(draft)])
  if (!product) return notFoundMetadata(draft)
  return buildMetadata({
    settings,
    path: `/products/${product.slug}/`,
    pageName: product.name,
    description: product.listSummary || product.heroSummary,
    seo: product.seo,
    image: mediaOf(product.listImage) ?? mediaOf(product.heroImage),
  })
}

function formatSize(bytes?: number | null): string {
  if (!bytes) return ''
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params
  const draft = await isDraft()
  const [product, settings, ui, theme, L] = await Promise.all([getProduct(slug, draft), getSettings(draft), getUiTexts(draft), getTheme(draft), getLocator()])
  if (!product) return redirectOr404(`/products/${slug}/`)

  const P = collectionDoc('products', product.id)
  // 文字样式要在生成页面内容之前登记（见 lib/locator.ts）
  const textStyles = textStyleSheet(P, product)
  const t = { ...ui.product, ...overrideTexts(product.sectionTexts) }
  const visible = <T extends { visible?: boolean | null }>(list: T[] | null | undefined) =>
    (list ?? []).map((item, index) => ({ item, index })).filter(({ item }) => item.visible !== false)
  // 产品自己填的文字优先；勾选“隐藏”时为空串；没填时用界面文案模板（模板也可能被隐藏）
  const own = (hidden: boolean | null | undefined, value: string | null | undefined, fallback: string) => (hidden ? '' : value || fallback)
  const heroKicker = own(product.heroKickerHidden, product.heroKicker, t.heroKicker)
  const proposalTitle = own(product.proposalTitleHidden, product.proposalTitle, t.proposalTitle)
  const proposalButton = own(product.proposalButtonTextHidden, product.proposalButtonText, t.proposalButton)
  const formTitle = own(product.formTitleHidden, product.formTitle, t.inquiryTitle)
  const formIntro = own(product.formIntroHidden, product.formIntro, t.inquiryIntro)
  const brochure = mediaOf(product.brochure)
  const zoomLabel = ui.common.clickToEnlarge
  const videoTexts = { playAria: ui.common.playVideo, videoError: ui.common.videoError, watchOnYouTube: ui.common.watchOnYouTube, contactUs: ui.common.contactUs, opensNewTab: ui.common.opensNewTab }

  const zoomable = (field: 'overviewImage' | 'flowImage' | 'detailImage', defaultFit: 'contain' | 'cover', ratioKey: string) => {
    const media = mediaOf(product[field])
    if (!media?.url) return null
    const ratio = pickRatio(product, field)
    const fit = product[`${field}Fit` as 'overviewImageFit']
    return (
      <div className="lp-wide-image">
        <ZoomButton items={[{ src: media.url, alt: media.alt ?? '', caption: media.caption, width: media.width, height: media.height }]} label={zoomLabel}>
          <Img media={media} ratio={ratio} fit={fit} defaultRatio={ratioKey} defaultFit={defaultFit} sizes="(max-width: 767px) 100vw, 880px" attrs={L(P, field)} />
        </ZoomButton>
      </div>
    )
  }

  const render = (module: ProductSectionKey, background: BackgroundSpec): React.ReactNode => {
    switch (module) {
      case 'hero': {
        const bg = backgroundProps(background)
        return (
          <div key={module} className={`lp-solution-hero ${bg.className}`} style={bg.style}>
            <Img media={product.heroImage} ratio={pickRatio(product, 'heroImage')} fit={product.heroImageFit} defaultRatio="original" defaultFit="contain" sizes="(max-width: 1311px) 90vw, 1180px" className="lp-detail-banner" priority attrs={L(P, 'heroImage')} />
            <div className="lp-solution-heading">
              {heroKicker ? (
                <div className="lp-kicker" {...L(P, 'heroKicker')}>
                  {heroKicker}
                </div>
              ) : null}
              <h1 {...L(P, 'name')}>{product.name}</h1>
              {product.heroSummary ? (
                <p className="lp-muted" style={{ whiteSpace: 'pre-line' }} {...L(P, 'heroSummary')}>
                  {product.heroSummary}
                </p>
              ) : null}
              {t.heroButton || brochure?.url ? (
              <div className="lp-actions">
                {t.heroButton ? (
                  <a href="#inquiry" className="lp-action" {...L(P, 'sectionTexts.heroButton')}>
                    {t.heroButton}
                  </a>
                ) : null}
                {brochure?.url ? (
                  <a
                    href={brochure.url}
                    className="lp-outline lp-brochure"
                    download
                    target="_blank"
                    rel="noopener"
                    data-track="download_brochure"
                    data-track-product={product.name}
                    {...L(P, 'brochure')}
                  >
                    {/* 按钮文字单独标注，产品手册分组里给“手册下载按钮”设的文字样式作用在这里 */}
                    <Download size={16} aria-hidden="true" /> <span {...L(P, 'sectionTexts.brochureButton')}>{t.brochureButton}</span>
                    <small>{fill(t.brochureMeta, { fileSize: formatSize(brochure.filesize) })}</small>
                  </a>
                ) : null}
              </div>
              ) : null}
            </div>
          </div>
        )
      }
      case 'applications': {
        const items = visible(product.applications).filter(({ item }) => item.name)
        if (!items.length) return null
        return (
          <Section key={module} background={background}>
            <SectionTitle title={{ text: t.applicationsTitle, attrs: L(P, 'sectionTexts.applicationsTitle') }} subtitle={{ text: t.applicationsSubtitle, attrs: L(P, 'sectionTexts.applicationsSubtitle') }} />
            <ul className="lp-grid4 lp-applications" aria-label={t.applicationsAria}>
              {items.map(({ item, index }) => (
                <li key={index} className="lp-application">
                  <Img media={item.image} ratio={pickRatio(item, 'image')} fit={item.imageFit} defaultRatio={defaultRatio(theme, 'application')} defaultFit="cover" sizes="(max-width: 767px) 50vw, 240px" attrs={L(P, `applications.${index}.image`)} />
                  <strong {...L(P, `applications.${index}.name`)}>{item.name}</strong>
                </li>
              ))}
            </ul>
          </Section>
        )
      }
      case 'introduction':
        if (!hasRichText(product.introduction) && !mediaOf(product.overviewImage)) return null
        return (
          <Section key={module} background={background}>
            <div className="lp-article">
              {t.introKicker ? (
                <div className="lp-kicker" {...L(P, 'sectionTexts.introKicker')}>
                  {t.introKicker}
                </div>
              ) : null}
              {t.introTitle ? <h2 {...L(P, 'sectionTexts.introTitle')}>{t.introTitle}</h2> : null}
              <RichText data={product.introduction} attrs={L(P, 'introduction')} />
              {zoomable('overviewImage', 'contain', 'original')}
            </div>
          </Section>
        )
      case 'features':
        if (!hasRichText(product.features) && !product.proposalText) return null
        return (
          <Section key={module} background={background}>
            <div className="lp-article">
              {hasRichText(product.features) ? (
                <>
                  {t.featuresTitle ? <h3 {...L(P, 'sectionTexts.featuresTitle')}>{t.featuresTitle}</h3> : null}
                  <RichText data={product.features} attrs={L(P, 'features')} />
                </>
              ) : null}
              {proposalTitle || product.proposalText || proposalButton ? (
                <div className="lp-proposal">
                  <div>
                    {proposalTitle ? <h3 {...L(P, 'proposalTitle')}>{proposalTitle}</h3> : null}
                    {product.proposalText ? (
                      <p className="lp-muted" style={{ margin: 0 }} {...L(P, 'proposalText')}>
                        {product.proposalText}
                      </p>
                    ) : null}
                  </div>
                  {proposalButton ? (
                    <a href="#inquiry" className="lp-action" {...L(P, 'proposalButtonText')}>
                      {proposalButton}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Section>
        )
      case 'process':
        if (!hasRichText(product.processText) && !mediaOf(product.flowImage)) return null
        return (
          <Section key={module} background={background}>
            <div className="lp-article">
              {t.processTitle ? <h3 {...L(P, 'sectionTexts.processTitle')}>{t.processTitle}</h3> : null}
              <RichText data={product.processText} attrs={L(P, 'processText')} />
              {zoomable('flowImage', 'contain', 'original')}
            </div>
          </Section>
        )
      case 'specs': {
        const table = <SpecTable value={product.specTable} texts={t} caption={t.specsTitle ? `${product.name} ${t.specsTitle}` : product.name} />
        // 没有公开且填了数值的行时整个模块不显示，避免只剩标题
        const spec = normalizeSpecTable(product.specTable)
        if (!spec.models.length || !publicRows(spec).length) return null
        return (
          <Section key={module} background={background} id="specifications">
            <div className="lp-article" {...L(P, 'specTable')}>
              {t.specsTitle ? <h3 {...L(P, 'sectionTexts.specsTitle')}>{t.specsTitle}</h3> : null}
              {table}
              {/* 顶部横幅的下载按钮容易被忽略，参数表下方再放一个入口（后台可关闭） */}
              {brochure?.url && product.brochureInSpecs !== false ? (
                <a
                  href={brochure.url}
                  className="lp-brochure-card"
                  download
                  target="_blank"
                  rel="noopener"
                  data-track="download_brochure"
                  data-track-location="specs"
                  data-track-product={product.name}
                  {...L(P, 'brochureInSpecs')}
                >
                  <Download size={20} aria-hidden="true" />
                  <span className="lp-brochure-card__text">
                    <b>{product.name}</b>
                    <small>{fill(t.brochureMeta, { fileSize: formatSize(brochure.filesize) })}</small>
                  </span>
                  <span className="lp-brochure-card__button" {...L(P, 'sectionTexts.brochureButton')}>
                    {t.brochureButton}
                  </span>
                </a>
              ) : null}
            </div>
          </Section>
        )
      }
      case 'audience':
        if (!hasRichText(product.audience) && !hasRichText(product.projectSupport) && !mediaOf(product.detailImage)) return null
        return (
          <Section key={module} background={background}>
            <div className="lp-article">
              <div className="lp-split" style={{ alignItems: 'start' }}>
                {hasRichText(product.audience) ? (
                  <div>
                    {t.audienceTitle ? <h3 {...L(P, 'sectionTexts.audienceTitle')}>{t.audienceTitle}</h3> : null}
                    <RichText data={product.audience} attrs={L(P, 'audience')} />
                  </div>
                ) : null}
                {hasRichText(product.projectSupport) ? (
                  <div>
                    {t.supportTitle ? <h3 {...L(P, 'sectionTexts.supportTitle')}>{t.supportTitle}</h3> : null}
                    <RichText data={product.projectSupport} attrs={L(P, 'projectSupport')} />
                  </div>
                ) : null}
              </div>
              {zoomable('detailImage', 'cover', defaultRatio(theme, 'equipment'))}
            </div>
          </Section>
        )
      case 'faqs': {
        const faqs = visible(product.faqs).filter(({ item }) => item.question && item.answer)
        if (!faqs.length) return null
        return (
          <Section key={module} background={background}>
            <div className="lp-article">
              {t.faqTitle ? <h3 {...L(P, 'sectionTexts.faqTitle')}>{t.faqTitle}</h3> : null}
              {faqs.map(({ item, index }) => (
                <details key={index} className="lp-faq">
                  <summary {...L(P, `faqs.${index}.question`)}>{item.question}</summary>
                  <p {...L(P, `faqs.${index}.answer`)}>{item.answer}</p>
                </details>
              ))}
            </div>
          </Section>
        )
      }
      case 'video': {
        const id = youtubeId(product.videoUrl)
        if (!id) return null
        const title = own(product.videoTitleHidden, product.videoTitle, t.videoTitle)
        // 标题被隐藏时，播放器的朗读名仍需要一个名字
        const playerTitle = title || product.name
        const cover = mediaOf(product.videoCover)
        return (
          <Section key={module} background={background}>
            <div className="lp-article" {...L(P, 'videoUrl')}>
              {title ? <h3 {...L(P, 'videoTitle')}>{title}</h3> : null}
              <VideoEmbed
                videoId={id}
                title={playerTitle}
                cover={cover?.url ? { url: cover.url, alt: cover.alt ?? '' } : null}
                texts={{ ...videoTexts, playAria: fill(ui.common.playVideo, { videoTitle: playerTitle }) || ui.common.playVideoGeneric }}
              />
            </div>
          </Section>
        )
      }
      case 'advantages': {
        const items = visible(product.advantages).filter(({ item }) => item.title)
        if (!items.length) return null
        return (
          <Section key={module} background={background} className="lp-benefits">
            <SectionTitle title={{ text: t.advantagesTitle, attrs: L(P, 'sectionTexts.advantagesTitle') }} subtitle={{ text: t.advantagesSubtitle, attrs: L(P, 'sectionTexts.advantagesSubtitle') }} />
            <div className="lp-grid3">
              {items.map(({ item, index }, i) => (
                <div key={index}>
                  <span className="lp-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 {...L(P, `advantages.${index}.title`)}>{item.title}</h3>
                  {item.description ? (
                    <p style={{ opacity: 0.85, whiteSpace: 'pre-line' }} {...L(P, `advantages.${index}.description`)}>
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        )
      }
      case 'processSteps': {
        const steps = visible(product.processSteps).filter(({ item }) => item.title)
        if (!steps.length) return null
        return (
          <Section key={module} background={background}>
            <ProcessSteps
              ariaLabel={t.stepsAria}
              stepAria={t.stepAria}
              header={
                <>
                  {t.stepsKicker ? (
                    <div className="lp-kicker" {...L(P, 'sectionTexts.stepsKicker')}>
                      {t.stepsKicker}
                    </div>
                  ) : null}
                  {t.stepsTitle ? <h2 {...L(P, 'sectionTexts.stepsTitle')}>{t.stepsTitle}</h2> : null}
                  {t.stepsSubtitle ? (
                    <p className="lp-muted" {...L(P, 'sectionTexts.stepsSubtitle')}>
                      {t.stepsSubtitle}
                    </p>
                  ) : null}
                </>
              }
              steps={steps.map(({ item, index }) => ({
                // 用列表行的固定编号，调整顺序或删除条目后选中状态不会错位
                key: item.id ?? `step-${index}`,
                title: item.title,
                titleAttrs: L(P, `processSteps.${index}.title`) as Record<string, string>,
                panel: (
                  <>
                    <Img media={item.image} ratio={pickRatio(item, 'image')} fit={item.imageFit} defaultRatio={defaultRatio(theme, 'equipment')} defaultFit="contain" sizes="(max-width: 767px) 100vw, 640px" attrs={L(P, `processSteps.${index}.image`)} />
                    <h3 {...L(P, `processSteps.${index}.title`)}>{item.title}</h3>
                    {item.description ? (
                      <p className="lp-muted" style={{ whiteSpace: 'pre-line' }} {...L(P, `processSteps.${index}.description`)}>
                        {item.description}
                      </p>
                    ) : null}
                  </>
                ),
              }))}
            />
          </Section>
        )
      }
      case 'relatedProducts': {
        const list = (product.relatedProducts ?? []).filter((p): p is Product => isVisibleDoc<Product>(p, draft) && p.id !== product.id)
        if (!list.length) return null
        return (
          <Section key={module} background={background}>
            <SectionTitle title={{ text: t.relatedTitle, attrs: L(P, 'sectionTexts.relatedTitle') }} subtitle={{ text: t.relatedSubtitle, attrs: L(P, 'sectionTexts.relatedSubtitle') }} />
            <div className="lp-grid3" {...L(P, 'relatedProducts')}>
              {list.map((item) => {
                const doc = collectionDoc('products', item.id)
                return (
                  <article key={item.id} className="lp-product">
                    <Img media={item.listImage} ratio={pickRatio(item, 'listImage')} fit={item.listImageFit} defaultRatio={defaultRatio(theme, 'equipment')} sizes="(max-width: 767px) 100vw, 400px" attrs={L(doc, 'listImage')} />
                    <div className="lp-product-body">
                      <h3 {...L(doc, 'name')}>
                        <Link href={`/products/${item.slug}/`}>{item.name}</Link>
                      </h3>
                      {t.relatedButton ? (
                        <Link href={`/products/${item.slug}/`} className="lp-link" {...L(P, 'sectionTexts.relatedButton')}>
                          {t.relatedButton}
                        </Link>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          </Section>
        )
      }
      case 'relatedCases': {
        const list = (product.relatedCases ?? []).filter((c): c is Case => isVisibleDoc<Case>(c, draft))
        if (!list.length) return null
        return (
          <Section key={module} background={background}>
            <SectionTitle title={{ text: t.casesTitle, attrs: L(P, 'sectionTexts.casesTitle') }} subtitle={{ text: t.casesSubtitle, attrs: L(P, 'sectionTexts.casesSubtitle') }} />
            <div className="lp-grid3" {...L(P, 'relatedCases')}>
              {list.map((item) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  L={L}
                  buttonText={t.casesButton}
                  buttonAttrs={L(P, 'sectionTexts.casesButton')}
                  ratio={defaultRatio(theme, 'case')}
                  variant="related"
                  draft={draft}
                />
              ))}
            </div>
          </Section>
        )
      }
      case 'inquiry':
        return (
          <Section key={module} background={background} id="inquiry">
            <div className="lp-split lp-detail-main">
              <div>
                {t.inquiryKicker ? (
                  <div className="lp-kicker" {...L(P, 'sectionTexts.inquiryKicker')}>
                    {t.inquiryKicker}
                  </div>
                ) : null}
                {formTitle ? <h2 {...L(P, 'formTitle')}>{formTitle}</h2> : null}
                {formIntro ? (
                  <p className="lp-muted" {...L(P, 'formIntro')}>
                    {formIntro}
                  </p>
                ) : null}
                <Img media={product.contactImage} ratio={pickRatio(product, 'contactImage')} fit={product.contactImageFit} defaultRatio={defaultRatio(theme, 'equipment')} defaultFit="cover" sizes="(max-width: 767px) 100vw, 560px" attrs={L(P, 'contactImage')} />
              </div>
              <InquiryForm
                source="product_page"
                texts={settings.form}
                countries={getCountries()}
                businessEmail={settings.email}
                product={{ id: product.id, name: product.name, code: product.productCode }}
                turnstileSiteKey={settings.turnstileSiteKey}
                locate={locateGroup(L, globalDoc('site-settings'), 'formTexts', FORM_TEXTS)}
              />
            </div>
          </Section>
        )
      default:
        return null
    }
  }

  const sections = orderedSections(product.sections, PRODUCT_SECTIONS, PRODUCT_SECTION_DEFAULT_BACKGROUND)
  const base = siteUrl()
  const image = mediaOf(product.listImage) ?? mediaOf(product.heroImage)

  return (
    <div className="lp-product-detail">
      {textStyles}
      <div className="lp-detail-breadcrumb">
        <Breadcrumbs
          label={ui.common.breadcrumb}
          items={[crumbHome(ui.common.home, L), crumbNav('/products/', settings.nav.products, 'products', L), { text: product.name, attrs: L(P, 'name') }]}
        />
      </div>
      {sections.map(({ module, background }) => render(module, background))}
      {/* 本页的 WhatsApp 链接预填带产品名的消息 */}
      <CurrentProduct name={product.name} />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: ui.common.home, path: '/' },
            { name: settings.nav.products, path: '/products/' },
            { name: product.name, path: `/products/${product.slug}/` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            sku: product.productCode || undefined,
            description: product.listSummary || product.heroSummary || undefined,
            image: image?.url || undefined,
            brand: settings.companyName ? { '@type': 'Brand', name: settings.companyName } : undefined,
            url: `${base}/products/${product.slug}/`,
          },
        ]}
      />
    </div>
  )
}
