// 首页（技术方案 3.3、4.3）
import {
  Award,
  ClipboardList,
  Factory,
  Globe,
  Headset,
  Package,
  Settings as Gear,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import type { Metadata } from 'next'
import { getImageProps } from 'next/image'
import Link from 'next/link'
import React from 'react'

import { CaseCard } from '@/components/CaseCard'
import { BannerCarousel } from '@/components/client/BannerCarousel'
import { ProductionGallery } from '@/components/client/ProductionGallery'
import { ImageModule, type ImageModuleRow } from '@/components/ImageModule'
import { imageSrc, Img, mediaOf, ownOrGroupFit, ownOrGroupRatio, pickRatio } from '@/components/Img'
import { linkHref, LinkTo } from '@/components/LinkTo'
import { galleryPhotos, PhotoGallery } from '@/components/PhotoGallery'
import { hasRichText, RichText } from '@/components/RichText'
import { backgroundProps, type BackgroundSpec, deviceClass, orderedSections, Section, SectionTitle } from '@/components/Section'
import { fill, withDefaults } from '@/content/defineTexts'
import * as T from '@/content/texts'
import { HOME_SECTION_DEFAULT_BACKGROUND, HOME_SECTIONS, IMAGE_SECTION_MODULES, isImageSectionModule } from '@/lib/constants'
import { getAboutPage, getHomePage, getSettings, getTheme, getUiTexts, isDraft, isVisibleDoc } from '@/lib/data'
import { collectionDoc, globalDoc } from '@/lib/locate'
import { getLocator, locateGroup, type Locator, textStyleSheet } from '@/lib/locator'
import { buildMetadata } from '@/lib/seo'
import { defaultRatio } from '@/lib/theme'
import type { Case, HomePage, Product } from '@/payload-types'

const H = globalDoc('home-page')
const S = globalDoc('site-settings')
const U = globalDoc('ui-texts')

const ICONS: Record<string, React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>> = {
  factory: Factory,
  settings: Gear,
  'clipboard-list': ClipboardList,
  wrench: Wrench,
  package: Package,
  headset: Headset,
  truck: Truck,
  globe: Globe,
  'shield-check': ShieldCheck,
  award: Award,
  users: Users,
  zap: Zap,
}

export async function generateMetadata(): Promise<Metadata> {
  const draft = await isDraft()
  const [settings, home] = await Promise.all([getSettings(draft), getHomePage(draft)])
  return buildMetadata({ settings, path: '/', pageName: settings.companyName || 'Home', seo: home.seo, isHome: true })
}

// index 是后台列表里的序号（用于定位字段）；first 表示显示出来的第一张：它的标题用 h1，图片优先加载
function BannerSlide({ slide, index, first, ui, L, draft }: { slide: NonNullable<NonNullable<HomePage['banners']>['slides']>[number]; index: number; first: boolean; ui: Awaited<ReturnType<typeof getUiTexts>>; L: Locator; draft: boolean }) {
  const desktop = mediaOf(slide.desktopImage) ?? mediaOf(slide.mobileImage)
  const mobile = mediaOf(slide.mobileImage) ?? desktop
  const product = isVisibleDoc<Product>(slide.product, draft) ? slide.product : null
  const path = `banners.slides.${index}`
  // 勾选了“隐藏”的不显示；没填时用界面文案里的默认值
  const kicker = slide.kickerHidden ? '' : slide.kicker || ui.banner.kickerDefault
  const quoteText = slide.quoteButtonTextHidden ? '' : slide.quoteButtonText || ui.banner.quoteButton
  const productText = !slide.productButtonTextHidden ? slide.productButtonText || (product ? ui.banner.productButton : ui.productList.viewDetails) : ''
  const common = { alt: desktop?.alt ?? '', fill: true, priority: first, loading: first ? undefined : ('lazy' as const) }
  // 桌面和手机分别使用各自的图片（技术方案 4.3 第 4 条）
  const desk = desktop?.url ? getImageProps({ ...common, src: imageSrc(desktop.url), sizes: '100vw', quality: 80 }).props : null
  const mob = mobile?.url ? getImageProps({ ...common, src: imageSrc(mobile.url), sizes: '100vw', quality: 75 }).props : null
  // 第 3 点：整张图可以设链接；第 4 点：遮罩深浅（0–90%，默认 50%）
  const link = linkHref(slide.link, draft)
  const overlay = typeof slide.overlay === 'number' ? Math.min(90, Math.max(0, slide.overlay)) / 100 : 0.5
  return (
    <>
      {desk ? (
        <div className="lp-banner-slide" style={{ '--overlay': overlay } as React.CSSProperties} {...L(H, `${path}.desktopImage`)}>
          <picture>
            {mob ? <source media="(max-width: 767px)" srcSet={mob.srcSet} /> : null}
            {/* 焦点交给样式按屏幕宽度选用：桌面用桌面图的焦点，手机用手机图的焦点 */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img
              {...desk}
              style={
                {
                  ...desk.style,
                  objectFit: 'cover',
                  '--focal': `${desktop?.focalX ?? 50}% ${desktop?.focalY ?? 50}%`,
                  '--focal-mobile': `${mobile?.focalX ?? 50}% ${mobile?.focalY ?? 50}%`,
                } as React.CSSProperties
              }
            />
          </picture>
        </div>
      ) : null}
      {link ? <LinkTo link={link} className="lp-banner-link" label={slide.title} /> : null}
      {/* 整图链接铺在文字下面：点文字以外的图片区域跳转，标题和副标题仍可以选中复制 */}
      <div className="lp-banner-copy">
        {kicker ? (
          <div className="lp-kicker" {...L(H, `${path}.kicker`)}>
            {kicker}
          </div>
        ) : null}
        {first ? <h1 {...L(H, `${path}.title`)}>{slide.title}</h1> : <h2 className="lp-h1" {...L(H, `${path}.title`)}>{slide.title}</h2>}
        {slide.subtitle ? <p {...L(H, `${path}.subtitle`)}>{slide.subtitle}</p> : null}
        {quoteText || productText ? (
          <div className="lp-actions">
            {productText ? (
              <LinkTo link={linkHref(slide.productLink, draft) ?? { href: product ? `/products/${product.slug}/` : '/products/', newTab: false }} className="lp-action" attrs={L(H, `${path}.productButtonText`)}>
                {productText}
              </LinkTo>
            ) : null}
            {quoteText ? (
              <LinkTo link={linkHref(slide.quoteLink, draft) ?? { href: product ? `/contact/?product=${encodeURIComponent(product.slug)}` : '/contact/', newTab: false }} className={productText ? 'lp-outline' : 'lp-action'} attrs={L(H, `${path}.quoteButtonText`)}>
                {quoteText}
              </LinkTo>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  )
}

export default async function HomePageView() {
  const draft = await isDraft()
  const [home, aboutPage, settings, ui, theme, L] = await Promise.all([getHomePage(draft), getAboutPage(draft), getSettings(draft), getUiTexts(draft), getTheme(draft), getLocator()])
  // 文字样式要在生成页面内容之前登记（见 lib/locator.ts）
  const textStyles = textStyleSheet(H, home)
  const aboutPhotoStyles = textStyleSheet(globalDoc('about-page'), aboutPage)
  const productStyles = (home.productLines?.products ?? []).filter((product): product is Product => isVisibleDoc<Product>(product, draft)).map((product) => textStyleSheet(collectionDoc('products', product.id), product))
  const caseStyles = (home.featuredCases?.cases ?? []).filter((item): item is Case => isVisibleDoc<Case>(item, draft)).map((item) => textStyleSheet(collectionDoc('cases', item.id), item))

  const services = withDefaults(T.HOME_SERVICES_TEXTS, home.services)
  const stats = withDefaults(T.HOME_STATS_TEXTS, home.companyStats)
  const about = withDefaults(T.HOME_ABOUT_TEXTS, home.aboutIntro)
  const factory = withDefaults(T.HOME_FACTORY_TEXTS, home.factoryGallery)
  const lines = withDefaults(T.HOME_LINES_TEXTS, home.productLines)
  const cases = withDefaults(T.HOME_CASES_TEXTS, home.featuredCases)
  const inquiry = home.inquiry?.custom ? withDefaults(T.CONTACT_BAND_TEXTS, home.inquiry) : settings.contactBand
  const inquiryDoc = home.inquiry?.custom ? H : S
  const inquiryPath = home.inquiry?.custom ? 'inquiry' : 'contactBand'
  const inquiryHref = home.inquiry?.custom ? linkHref(home.inquiry.link, draft) : null
  const videoTexts = { playAria: ui.common.playVideo, videoError: ui.common.videoError, watchOnYouTube: ui.common.watchOnYouTube, contactUs: ui.common.contactUs, opensNewTab: ui.common.opensNewTab }

  const sections = orderedSections(home.sections, HOME_SECTIONS, HOME_SECTION_DEFAULT_BACKGROUND, IMAGE_SECTION_MODULES.map((m) => m.value))
  const bannerSlides = (home.banners?.slides ?? []).map((slide, index) => ({ slide, index })).filter(({ slide }) => slide.enabled !== false && slide.title)
  const firstDesktopImage = bannerSlides.map(({ slide }) => mediaOf(slide.desktopImage) ?? mediaOf(slide.mobileImage)).find(Boolean)
  const firstMobileImage = bannerSlides.map(({ slide }) => mediaOf(slide.mobileImage)).find(Boolean)
  // 主标题 h1 在第一张 Banner 里；Banner 模块隐藏或没有可播放的 Banner 时另给一个读屏可见的 h1（技术方案 8.1）
  const bannerSection = bannerSlides.length > 0 ? sections.find(({ module }) => module === 'banners') : undefined
  // Banner 只在某一类设备上显示时，另一类设备也要有 h1
  const bannerDevice = bannerSection ? deviceClass(bannerSection.background) : ''

  const render = (module: (typeof HOME_SECTIONS)[number]['value'], background: BackgroundSpec): React.ReactNode => {
    switch (module) {
      case 'banners': {
        if (!bannerSlides.length) return null
        return (
          <BannerCarousel
            key={module}
            className={deviceClass(background)}
            ratio={defaultRatio(theme, 'banner')}
            mediaRatio={firstDesktopImage?.width && firstDesktopImage.height ? firstDesktopImage.width / firstDesktopImage.height : undefined}
            mobileMediaRatio={firstMobileImage?.width && firstMobileImage.height ? firstMobileImage.width / firstMobileImage.height : undefined}
            texts={ui.banner}
            locate={locateGroup(L, U, 'banner', T.UI_BANNER)}
            slides={bannerSlides.map(({ slide, index }, position) => (
              <BannerSlide key={index} slide={slide} index={index} first={position === 0} ui={ui} L={L} draft={draft} />
            ))}
          />
        )
      }
      case 'services': {
        const items = (home.services?.items ?? []).map((item, index) => ({ item, index })).filter(({ item }) => item.name)
        if (!items.length) return null
        return (
          <Section key={module} id="services" background={background} className="lp-home-services">
            <SectionTitle title={{ text: services.title, attrs: L(H, 'services.title') }} subtitle={{ text: services.subtitle, attrs: L(H, 'services.subtitle') }} />
            <ul className="lp-store-service-grid">
              {items.map(({ item, index }) => {
                const Icon = ICONS[item.icon ?? 'factory'] ?? Factory
                return (
                  <li key={index} {...L(H, `services.items.${index}.name`)}>
                    <Icon aria-hidden />
                    <span>{item.name}</span>
                  </li>
                )
              })}
            </ul>
          </Section>
        )
      }
      case 'companyStats': {
        const list = (home.companyStats?.stats ?? []).map((s, index) => ({ s, index })).filter(({ s }) => s.value && s.label)
        if (!list.length && !settings.companyName) return null
        const bg = backgroundProps(background, 'lp-bg-blue')
        return (
          <div key={module} className={`lp-store-company ${bg.className}`} style={bg.style}>
            <div className="lp-store-brandline">
              {stats.supplierLabel ? <span {...L(H, 'companyStats.supplierLabel')}>{stats.supplierLabel}</span> : null}
              {settings.companyName ? <strong {...L(S, 'companyName')}>{settings.companyName}</strong> : null}
            </div>
            {list.length ? (
              <ul className="lp-store-stats">
                {list.map(({ s, index }) => (
                  <li key={index}>
                    <strong {...L(H, `companyStats.stats.${index}.value`)}>{s.value}</strong>
                    <span {...L(H, `companyStats.stats.${index}.label`)}>{s.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )
      }
      case 'aboutIntro': {
        const tags = (home.aboutIntro?.tags ?? []).map((t, index) => ({ t, index })).filter(({ t }) => t.label)
        const companyTitle = fill(about.companyTitle, { companyName: settings.companyName })
        const useHomeImage = Boolean(mediaOf(home.aboutIntro?.image))
        const imageSource = useHomeImage ? home.aboutIntro : aboutPage.intro
        const image = mediaOf(imageSource?.image)
        const homePhotos = galleryPhotos(home.aboutIntro?.photos)
        const photos = homePhotos.length ? homePhotos : useHomeImage ? [] : galleryPhotos(aboutPage.intro?.photos)
        // 正文、公司名标题、标签都没有时整个模块不显示（小标题、标题和按钮只是模块外壳）
        if (!companyTitle && !hasRichText(home.aboutIntro?.body) && !tags.length && !image && !photos.length) return null
        return (
          <Section key={module} id="company" background={background} className="lp-store-about lp-home-story">
            <div className={image || photos.length ? 'lp-home-story-copy has-image' : 'lp-home-story-copy'}>
              <aside>
                {about.kicker ? <div className="lp-kicker" {...L(H, 'aboutIntro.kicker')}>{about.kicker}</div> : null}
                {about.title ? <h2 {...L(H, 'aboutIntro.title')}>{about.title}</h2> : null}
                {tags.length ? (
                  <ul>
                    {tags.map(({ t, index }) => <li key={index} {...L(H, `aboutIntro.tags.${index}.label`)}>{t.label}</li>)}
                  </ul>
                ) : null}
              </aside>
              <div className="lp-store-about-copy">
                {companyTitle ? <h3 {...L(H, 'aboutIntro.companyTitle')}>{companyTitle}</h3> : null}
                <RichText data={home.aboutIntro?.body} attrs={L(H, 'aboutIntro.body')} />
                {about.buttonText ? (
                  <LinkTo link={linkHref(home.aboutIntro?.buttonLink, draft) ?? { href: '/about/', newTab: false }} className="lp-store-blue-button" attrs={L(H, 'aboutIntro.buttonText')}>
                    {about.buttonText}
                  </LinkTo>
                ) : null}
              </div>
            </div>
            {photos.length ? (
              <PhotoGallery photos={photos} doc={homePhotos.length ? H : globalDoc('about-page')} basePath={homePhotos.length ? 'aboutIntro' : 'intro'} L={L} zoomLabel={ui.common.clickToEnlarge} />
            ) : <Img media={image} ratio={pickRatio(imageSource, 'image')} fit={imageSource?.imageFit} defaultRatio="original" sizes="(max-width: 767px) 100vw, 650px" attrs={useHomeImage ? L(H, 'aboutIntro.image') : L(globalDoc('about-page'), 'intro.image')} />}
          </Section>
        )
      }
      case 'factoryGallery': {
        const items = (home.factoryGallery?.items ?? []).map((item, index) => ({ item, index, media: mediaOf(item.image) })).filter(({ media }) => media?.url)
        if (!items.length) return null
        return (
          <Section key={module} background={background}>
            <SectionTitle
              kicker={{ text: factory.kicker, attrs: L(H, 'factoryGallery.kicker') }}
              title={{ text: factory.title, attrs: L(H, 'factoryGallery.title') }}
              subtitle={{ text: factory.subtitle, attrs: L(H, 'factoryGallery.subtitle') }}
            />
            <div className="lp-store-factory-grid">
              {items.map(({ item, index, media }) => {
                // 单张图片另选了比例 / 适配方式时以单张为准，否则用这一组的统一设置
                return (
                  <LinkTo key={item.id ?? index} link={linkHref(item.link, draft)} className="lp-image-link" label={media!.alt || undefined}>
                    <Img
                      media={media}
                      ratio={ownOrGroupRatio(item, 'image', pickRatio(home.factoryGallery, 'images'))}
                      fit={ownOrGroupFit(item, 'image', home.factoryGallery?.imagesFit)}
                      defaultRatio={defaultRatio(theme, 'factory')}
                      defaultFit="cover"
                      sizes="(max-width: 767px) 100vw, 400px"
                      attrs={L(H, `factoryGallery.items.${index}.image`)}
                    />
                  </LinkTo>
                )
              })}
            </div>
          </Section>
        )
      }
      case 'productLines': {
        const products = (home.productLines?.products ?? []).filter((p): p is Product => isVisibleDoc<Product>(p, draft))
        if (!products.length) return null
        return (
          <Section key={module} id="lines" background={background} className="lp-home-production">
            <ProductionGallery title={<SectionTitle title={{ text: lines.title, attrs: L(H, 'productLines.title') }} subtitle={{ text: lines.subtitle, attrs: L(H, 'productLines.subtitle') }} />} labels={{ prev: ui.banner.prev, next: ui.banner.next }} items={products.map((product) => {
              const doc = collectionDoc('products', product.id)
              const href = `/products/${product.slug}/`
              return (
                <article key={product.id} className="lp-production-slide">
                  {mediaOf(product.listImage) ? (
                    <LinkTo link={linkHref(product.listLink, draft) ?? { href, newTab: false }} className="lp-production-image" label={product.name}>
                      <Img media={product.listImage} ratio={pickRatio(product, 'listImage')} fit={product.listImageFit} defaultRatio="12/5" defaultFit="cover" sizes="(max-width: 767px) 90vw, 900px" attrs={L(doc, 'listImage')} />
                    </LinkTo>
                  ) : null}
                  <div className="lp-production-caption">
                    <h3 {...L(doc, 'name')}><Link href={href}>{product.name}</Link></h3>
                    {product.listSummary ? <p {...L(doc, 'listSummary')}>{product.listSummary}</p> : null}
                    {lines.buttonText ? <Link className="lp-link" href={href} {...L(H, 'productLines.buttonText')}>{lines.buttonText}</Link> : null}
                  </div>
                </article>
              )
            })} />
            {lines.inquiryButton ? <div className="lp-production-tail"><LinkTo className="lp-link" link={linkHref(home.productLines?.inquiryLink, draft) ?? { href: '/contact/', newTab: false }} attrs={L(H, 'productLines.inquiryButton')}>{lines.inquiryButton}</LinkTo></div> : null}
          </Section>
        )
      }
      case 'featuredCases': {
        // 案例被撤下后自动从首页精选中消失，不留空卡片（技术方案 3.5）
        const list = (home.featuredCases?.cases ?? []).filter((c): c is Case => isVisibleDoc<Case>(c, draft)).slice(0, 3)
        if (!list.length) return null
        return (
          <Section key={module} id="cases" background={background} className={list.length === 1 ? 'lp-home-cases lp-home-cases--single' : 'lp-home-cases'}>
            <div className="lp-home-cases-heading">
              <SectionTitle
                kicker={{ text: cases.kicker, attrs: L(H, 'featuredCases.kicker') }}
                title={{ text: cases.title, attrs: L(H, 'featuredCases.title') }}
                subtitle={{ text: cases.subtitle, attrs: L(H, 'featuredCases.subtitle') }}
              />
              {cases.allButton ? (
                <LinkTo link={linkHref(home.featuredCases?.allLink, draft) ?? { href: '/case-studies/', newTab: false }} className="lp-outline" attrs={L(H, 'featuredCases.allButton')}>
                  {cases.allButton}
                </LinkTo>
              ) : null}
            </div>
            <div className="lp-grid3">
              {list.map((item) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  L={L}
                  buttonText={cases.cardButton}
                  buttonAttrs={L(H, 'featuredCases.cardButton')}
                  ratio={defaultRatio(theme, 'case')}
                  variant="featured"
                  labels={{ country: ui.caseList.countryLabel, equipment: ui.caseList.equipmentLabel }}
                  photosLabel={{ text: ui.caseDetail.photos || 'Project Photos', attrs: L(U, 'caseDetail.photos') }}
                  zoomLabel={ui.common.clickToEnlarge}
                  videoTexts={videoTexts}
                  draft={draft}
                />
              ))}
            </div>
          </Section>
        )
      }
      default:
        return null
    }
  }

  const content = sections
    .map(({ module, background, row, index }) =>
      isImageSectionModule(module) ? (
        <ImageModule key={row.id ?? `${module}-${index}`} row={row as ImageModuleRow} index={index} background={background} doc={H} L={L} draft={draft} />
      ) : (
        render(module, background)
      ),
    )
    .filter(Boolean)
  // 没有 Banner 时给读屏一个 h1；Banner 只在电脑（或只在手机）显示时，另一类设备上也补一个
  const srTitle = !bannerSection ? 'sr-only' : bannerDevice === 'lp-only-desktop' ? 'sr-only lp-only-mobile' : bannerDevice === 'lp-only-mobile' ? 'sr-only lp-only-desktop' : null
  return (
    <div className={`lp-home${theme.bannerWidth === 'full' ? ' lp-home-wide' : ''}`} data-home-topbar={home.showTopBar ? 'show' : 'hide'}>
      {textStyles}
      {aboutPhotoStyles}
      {productStyles}
      {caseStyles}
      {srTitle ? <h1 className={srTitle}>{settings.companyName || 'Home'}</h1> : null}
      {content}
      {inquiry.title || inquiry.text || inquiry.buttonText ? (
        <section id="quote" className="lp-contact-band lp-home-quote">
          <div>
            {inquiry.title ? <h2 {...L(inquiryDoc, `${inquiryPath}.title`)}>{inquiry.title}</h2> : null}
            {inquiry.text ? <p {...L(inquiryDoc, `${inquiryPath}.text`)}>{inquiry.text}</p> : null}
          </div>
          {inquiry.buttonText ? (
            <LinkTo link={inquiryHref ?? { href: '/contact/', newTab: false }} className="lp-action" attrs={L(inquiryDoc, `${inquiryPath}.buttonText`)}>
              {inquiry.buttonText}
            </LinkTo>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
