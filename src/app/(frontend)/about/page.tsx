// 关于我们（技术方案 3.3）
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Img, mediaOf, ownOrGroupFit, ownOrGroupRatio, pickRatio } from '@/components/Img'
import { linkHref, LinkTo, type LinkValue } from '@/components/LinkTo'
import { hasRichText, RichText } from '@/components/RichText'
import { type BackgroundSpec, Breadcrumbs, crumbHome, crumbNav, orderedSections, PageBanner, Section, SectionTitle } from '@/components/Section'
import { withDefaults } from '@/content/defineTexts'
import * as T from '@/content/texts'
import { ABOUT_SECTION_DEFAULT_BACKGROUND, ABOUT_SECTIONS } from '@/lib/constants'
import { getAboutPage, getSettings, getTheme, getUiTexts, isDraft } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import { getLocator, textStyleSheet } from '@/lib/locator'
import { breadcrumbJsonLd, buildMetadata, JsonLd } from '@/lib/seo'
import { defaultRatio } from '@/lib/theme'
import type { Media } from '@/payload-types'

const A = globalDoc('about-page')

type GridItem = { image?: Media | number | null; imageRatio?: string | null; imageRatioCustom?: string | null; imageFit?: string | null; title?: string | null; description?: string | null; link?: LinkValue }
type GridGroup = { display?: string | null; columns?: string | null; imagesRatio?: string | null; imagesRatioCustom?: string | null; imagesFit?: string | null; items?: GridItem[] | null }

export async function generateMetadata(): Promise<Metadata> {
  const draft = await isDraft()
  const [settings, page] = await Promise.all([getSettings(draft), getAboutPage(draft)])
  const banner = withDefaults(T.ABOUT_BANNER_TEXTS, page.banner)
  return buildMetadata({ settings, path: '/about/', pageName: banner.title, seo: page.seo })
}

export default async function AboutPageView() {
  const draft = await isDraft()
  const [page, settings, ui, theme, L] = await Promise.all([getAboutPage(draft), getSettings(draft), getUiTexts(draft), getTheme(draft), getLocator()])
  // 文字样式要在生成页面内容之前登记（见 lib/locator.ts）
  const textStyles = textStyleSheet(A, page)
  const banner = withDefaults(T.ABOUT_BANNER_TEXTS, page.banner)
  const intro = withDefaults(T.ABOUT_INTRO_TEXTS, page.intro)
  const scenes = withDefaults(T.ABOUT_SCENES_TEXTS, page.scenes)
  const caps = withDefaults(T.ABOUT_CAPABILITIES_TEXTS, page.capabilities)

  const render = (module: (typeof ABOUT_SECTIONS)[number]['value'], background: BackgroundSpec): React.ReactNode => {
    switch (module) {
      case 'intro':
        // 正文和图片都没有时整块不显示（小标题、标题和按钮只是模块外壳）
        if (!hasRichText(page.intro?.body) && !mediaOf(page.intro?.image)) return null
        return (
          <Section key={module} background={background}>
            <div className="lp-split">
              <div>
                {intro.kicker ? (
                  <div className="lp-kicker" {...L(A, 'intro.kicker')}>
                    {intro.kicker}
                  </div>
                ) : null}
                {intro.title ? <h2 {...L(A, 'intro.title')}>{intro.title}</h2> : null}
                <RichText data={page.intro?.body} attrs={L(A, 'intro.body')} />
                {intro.buttonText ? (
                  <div className="lp-actions">
                    <Link href="/contact/" className="lp-action" {...L(A, 'intro.buttonText')}>
                      {intro.buttonText}
                    </Link>
                  </div>
                ) : null}
              </div>
              <Img media={page.intro?.image} ratio={pickRatio(page.intro, 'image')} fit={page.intro?.imageFit} defaultRatio={defaultRatio(theme, 'factory')} defaultFit="cover" sizes="(max-width: 767px) 100vw, 560px" attrs={L(A, 'intro.image')} />
            </div>
          </Section>
        )
      case 'scenes':
      case 'capabilities': {
        const group = page[module] as GridGroup | undefined
        const texts = module === 'scenes' ? scenes : caps
        const imagesOnly = group?.display === 'images'
        // 纯图片：有图才显示；图文卡片：有标题才显示（与改版前一致）
        const items = (group?.items ?? []).map((item, index) => ({ item, index })).filter(({ item }) => (imagesOnly ? mediaOf(item.image) : item.title))
        if (!items.length) return null
        const columns = ['2', '3', '4'].includes(group?.columns ?? '') ? group?.columns : '3'
        const sizes = `(max-width: 767px) 100vw, (max-width: 1179px) 50vw, ${Math.round(1180 / Number(columns))}px`
        return (
          <Section key={module} background={background}>
            <SectionTitle title={{ text: texts.title, attrs: L(A, `${module}.title`) }} subtitle={{ text: texts.subtitle, attrs: L(A, `${module}.subtitle`) }} />
            <div className={`lp-grid3 lp-cols-${columns}`}>
              {items.map(({ item, index }) => {
                const path = `${module}.items.${index}`
                // 单张图片另选了比例 / 适配方式时以单张为准，否则纯图片方式用模块统一设置
                const image = (
                  <Img
                    media={item.image}
                    ratio={ownOrGroupRatio(item, 'image', imagesOnly ? pickRatio(group, 'images') : null)}
                    fit={ownOrGroupFit(item, 'image', imagesOnly ? group?.imagesFit : null)}
                    defaultRatio={defaultRatio(theme, 'factory')}
                    defaultFit="cover"
                    sizes={sizes}
                    alt={item.title ?? undefined}
                    attrs={L(A, `${path}.image`)}
                  />
                )
                return (
                  <div key={index}>
                    {mediaOf(item.image) ? (
                      <LinkTo link={linkHref(item.link, draft)} className="lp-image-link" label={item.title ?? undefined}>
                        {image}
                      </LinkTo>
                    ) : null}
                    {item.title ? (
                      imagesOnly ? (
                        <p className="lp-image-caption" {...L(A, `${path}.title`)}>
                          {item.title}
                        </p>
                      ) : (
                        <h3 {...L(A, `${path}.title`)}>{item.title}</h3>
                      )
                    ) : null}
                    {!imagesOnly && item.description ? (
                      <p className="lp-muted" style={{ whiteSpace: 'pre-line' }} {...L(A, `${path}.description`)}>
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </Section>
        )
      }
      default:
        return null
    }
  }

  return (
    <>
      {textStyles}
      <PageBanner
        breadcrumb={<Breadcrumbs label={ui.common.breadcrumb} items={[crumbHome(ui.common.home, L), crumbNav('/about/', settings.nav.about, 'about', L)]} />}
        title={{ text: banner.title, attrs: L(A, 'banner.title') }}
        subtitle={{ text: banner.subtitle, attrs: L(A, 'banner.subtitle') }}
      />
      {orderedSections(page.sections, ABOUT_SECTIONS, ABOUT_SECTION_DEFAULT_BACKGROUND).map(({ module, background }) => render(module, background))}
      <JsonLd data={breadcrumbJsonLd([{ name: ui.common.home, path: '/' }, { name: settings.nav.about, path: '/about/' }])} />
    </>
  )
}
