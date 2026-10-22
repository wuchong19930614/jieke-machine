// 关于我们（技术方案 3.3）
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Img, mediaOf } from '@/components/Img'
import { hasRichText, RichText } from '@/components/RichText'
import { Breadcrumbs, crumbHome, crumbNav, orderedSections, PageBanner, Section, SectionTitle } from '@/components/Section'
import { withDefaults } from '@/content/defineTexts'
import * as T from '@/content/texts'
import { ABOUT_SECTION_DEFAULT_BACKGROUND, ABOUT_SECTIONS } from '@/lib/constants'
import { getAboutPage, getSettings, getTheme, getUiTexts, isDraft } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import { getLocator } from '@/lib/locator'
import { breadcrumbJsonLd, buildMetadata, JsonLd } from '@/lib/seo'
import { defaultRatio } from '@/lib/theme'

const A = globalDoc('about-page')

export async function generateMetadata(): Promise<Metadata> {
  const draft = await isDraft()
  const [settings, page] = await Promise.all([getSettings(draft), getAboutPage(draft)])
  const banner = withDefaults(T.ABOUT_BANNER_TEXTS, page.banner)
  return buildMetadata({ settings, path: '/about/', pageName: banner.title, seo: page.seo })
}

export default async function AboutPageView() {
  const draft = await isDraft()
  const [page, settings, ui, theme, L] = await Promise.all([getAboutPage(draft), getSettings(draft), getUiTexts(draft), getTheme(draft), getLocator()])
  const banner = withDefaults(T.ABOUT_BANNER_TEXTS, page.banner)
  const intro = withDefaults(T.ABOUT_INTRO_TEXTS, page.intro)
  const scenes = withDefaults(T.ABOUT_SCENES_TEXTS, page.scenes)
  const caps = withDefaults(T.ABOUT_CAPABILITIES_TEXTS, page.capabilities)

  const render = (module: (typeof ABOUT_SECTIONS)[number]['value'], background: string): React.ReactNode => {
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
              <Img media={page.intro?.image} ratio={page.intro?.imageRatio} fit={page.intro?.imageFit} defaultRatio={defaultRatio(theme, 'factory')} defaultFit="cover" sizes="(max-width: 767px) 100vw, 560px" attrs={L(A, 'intro.image')} />
            </div>
          </Section>
        )
      case 'scenes': {
        const items = (page.scenes?.items ?? []).map((item, index) => ({ item, index })).filter(({ item }) => item.title)
        if (!items.length) return null
        return (
          <Section key={module} background={background}>
            <SectionTitle title={{ text: scenes.title, attrs: L(A, 'scenes.title') }} subtitle={{ text: scenes.subtitle, attrs: L(A, 'scenes.subtitle') }} />
            <div className="lp-grid3">
              {items.map(({ item, index }) => (
                <div key={index}>
                  <Img media={item.image} defaultRatio={defaultRatio(theme, 'factory')} defaultFit="cover" sizes="(max-width: 767px) 100vw, 400px" attrs={L(A, `scenes.items.${index}.image`)} />
                  <h3 {...L(A, `scenes.items.${index}.title`)}>{item.title}</h3>
                  {item.description ? (
                    <p className="lp-muted" style={{ whiteSpace: 'pre-line' }} {...L(A, `scenes.items.${index}.description`)}>
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        )
      }
      case 'capabilities': {
        const items = (page.capabilities?.items ?? []).map((item, index) => ({ item, index })).filter(({ item }) => item.title)
        if (!items.length) return null
        return (
          <Section key={module} background={background}>
            <SectionTitle title={{ text: caps.title, attrs: L(A, 'capabilities.title') }} subtitle={{ text: caps.subtitle, attrs: L(A, 'capabilities.subtitle') }} />
            <div className="lp-grid3">
              {items.map(({ item, index }) => (
                <div key={index}>
                  <h3 {...L(A, `capabilities.items.${index}.title`)}>{item.title}</h3>
                  {item.description ? (
                    <p className="lp-muted" style={{ whiteSpace: 'pre-line' }} {...L(A, `capabilities.items.${index}.description`)}>
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
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
