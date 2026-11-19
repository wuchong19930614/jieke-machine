// 案例详情（技术方案 3.5、4.4）
import type { Metadata } from 'next'
import Link from 'next/link'

import { notFoundMetadata } from '@/components/AuxPage'
import { galleryPhotos, PhotoGallery } from '@/components/PhotoGallery'
import { VideoEmbed } from '@/components/client/VideoEmbed'
import { Img, mediaOf, pickRatio } from '@/components/Img'
import { hasRichText, RichText } from '@/components/RichText'
import { Breadcrumbs, crumbHome, crumbNav, PageBanner, Section } from '@/components/Section'
import { fill } from '@/content/defineTexts'
import { overrideTexts } from '@/content/overrideFields'
import { countryName } from '@/lib/countries'
import { getCase, getSettings, getTheme, getUiTexts, isDraft, isVisibleDoc, publishedSlugs } from '@/lib/data'
import { collectionDoc } from '@/lib/locate'
import { getLocator, textStyleSheet } from '@/lib/locator'
import { redirectOr404 } from '@/lib/redirectOr404'
import { breadcrumbJsonLd, buildMetadata, JsonLd } from '@/lib/seo'
import { defaultRatio } from '@/lib/theme'
import { youtubeId } from '@/lib/youtube'
import type { Product } from '@/payload-types'

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = true

export async function generateStaticParams() {
  return (await publishedSlugs('cases')).map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const draft = await isDraft()
  const [item, settings] = await Promise.all([getCase(slug, draft), getSettings(draft)])
  if (!item) return notFoundMetadata(draft)
  return buildMetadata({
    settings,
    path: `/case-studies/${item.slug}/`,
    pageName: item.title,
    description: item.summary || item.equipmentConfiguration,
    seo: item.seo,
    image: mediaOf(item.coverImage),
  })
}

// 交付日期显示为 “March 2025”（英文界面文案 8.2）
const formatMonth = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)) : ''

export default async function CaseDetailPage({ params }: Params) {
  const { slug } = await params
  const draft = await isDraft()
  const [item, settings, ui, theme, L] = await Promise.all([getCase(slug, draft), getSettings(draft), getUiTexts(draft), getTheme(draft), getLocator()])
  if (!item) return redirectOr404(`/case-studies/${slug}/`)

  const C = collectionDoc('cases', item.id)
  // 文字样式要在生成页面内容之前登记（见 lib/locator.ts）
  const textStyles = textStyleSheet(C, item)
  const t = { ...ui.caseDetail, ...overrideTexts(item.sectionTexts) }
  const lines = (item.products ?? []).filter((p): p is Product => isVisibleDoc<Product>(p, draft))
  const gallery = galleryPhotos(item.photos, item.gallery ?? [], pickRatio(item, 'gallery'), item.galleryFit, item.summary || item.title)
  const video = youtubeId(item.videoUrl)
  const cover = mediaOf(item.videoCover) ?? mediaOf(item.coverImage)
  const heroField = mediaOf(item.heroImage) ? 'heroImage' : 'coverImage'
  const hero = mediaOf(item[heroField])
  const heroPhoto = gallery.find(({ media }) => media.id === hero?.id)
  const heroCaption = heroField === 'coverImage'
    ? item.coverCaption || heroPhoto?.caption || item.summary || hero?.caption
    : heroPhoto?.caption || hero?.caption || item.summary || item.title
  const heroCaptionPath = heroField === 'coverImage' && item.coverCaption
    ? 'coverCaption'
    : heroPhoto?.path ? `${heroPhoto.path}.caption` : 'summary'
  const galleryPhotosAfterHero = gallery.filter(({ media }) => media.id !== hero?.id)

  const overview = [
    item.showCustomerName && item.customerName ? { label: t.customer, labelKey: 'customer', value: item.customerName, path: 'customerName' } : null,
    item.country ? { label: t.country, labelKey: 'country', value: countryName(item.country), path: 'country' } : null,
    item.equipmentConfiguration ? { label: t.configuration, labelKey: 'configuration', value: item.equipmentConfiguration, path: 'equipmentConfiguration' } : null,
    item.capacity ? { label: t.capacity, labelKey: 'capacity', value: item.capacity, path: 'capacity' } : null,
    item.deliveryDate ? { label: t.deliveryDate, labelKey: 'deliveryDate', value: formatMonth(item.deliveryDate), path: 'deliveryDate' } : null,
  ].filter(Boolean) as { label: string; labelKey: string; value: string; path: string }[]

  const body = [
    { key: 'customerRequirements', title: t.requirements, titlePath: 'sectionTexts.requirements' },
    { key: 'solution', title: t.solution, titlePath: 'sectionTexts.solution' },
    { key: 'deliveryOperation', title: t.delivery, titlePath: 'sectionTexts.delivery' },
  ] as const

  return (
    <>
      {textStyles}
      <PageBanner
        breadcrumb={
          <Breadcrumbs
            label={ui.common.breadcrumb}
            items={[crumbHome(ui.common.home, L), crumbNav('/case-studies/', settings.nav.cases, 'cases', L), { text: item.title, attrs: L(C, 'title') }]}
          />
        }
        title={{ text: item.title, attrs: L(C, 'title') }}
      >
        {t.back ? (
          <Link href="/case-studies/" className="lp-link" {...L(C, 'sectionTexts.back')}>
            {t.back}
          </Link>
        ) : null}
      </PageBanner>
      <Section>
        <div className="lp-article">
          {hero ? <figure className="lp-wide-image">
            <Img
              media={item[heroField]}
              ratio={pickRatio(item, heroField)}
              fit={item[`${heroField}Fit`]}
              defaultRatio={defaultRatio(theme, 'case')}
              defaultFit="cover"
              sizes="(max-width: 767px) 100vw, 880px"
              priority
              attrs={L(C, heroField)}
            />
            {heroCaption ? <figcaption className="lp-muted lp-case-description" {...L(C, heroCaptionPath)}>{heroCaption}</figcaption> : null}
          </figure> : null}
          {overview.length ? (
            <>
              {t.overviewTitle ? <h2 {...L(C, 'sectionTexts.overviewTitle')}>{t.overviewTitle}</h2> : null}
              <table className="lp-specs">
                <tbody>
                  {overview.map((row) => (
                    <tr key={row.path}>
                      <th scope="row" style={{ width: '42%' }} {...L(C, `sectionTexts.${row.labelKey}`)}>
                        {row.label}
                      </th>
                      <td style={{ whiteSpace: 'pre-line' }} {...L(C, row.path)}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
          {body.map((section) =>
            hasRichText(item[section.key]) ? (
              <div key={section.key}>
                {section.title ? <h3 {...L(C, section.titlePath)}>{section.title}</h3> : null}
                <RichText data={item[section.key]} attrs={L(C, section.key)} />
              </div>
            ) : null,
          )}
          {galleryPhotosAfterHero.length ? (
            <>
              {t.photos ? <h3 {...L(C, 'sectionTexts.photos')}>{t.photos}</h3> : null}
              <PhotoGallery photos={galleryPhotosAfterHero} doc={C} L={L} zoomLabel={ui.common.clickToEnlarge} />
            </>
          ) : null}
          {video ? (
            <>
              {t.video ? <h3 {...L(C, 'sectionTexts.video')}>{t.video}</h3> : null}
              <div {...L(C, 'videoUrl')}>
                <VideoEmbed
                  videoId={video}
                  title={item.title}
                  cover={cover?.url ? { url: cover.url, alt: cover.alt ?? '' } : null}
                  texts={{
                    playAria: fill(ui.common.playVideo, { videoTitle: item.title }) || ui.common.playVideoGeneric,
                    videoError: ui.common.videoError,
                    watchOnYouTube: ui.common.watchOnYouTube,
                    contactUs: ui.common.contactUs,
                    opensNewTab: ui.common.opensNewTab,
                  }}
                />
              </div>
            </>
          ) : null}
          {lines.length ? (
            <>
              {t.linesUsed ? <h3 {...L(C, 'sectionTexts.linesUsed')}>{t.linesUsed}</h3> : null}
              <ul {...L(C, 'products')}>
                {lines.map((p) => (
                  <li key={p.id}>
                    {/* 链接文字被隐藏时，改为点生产线名称进入详情 */}
                    {t.linesButton ? (
                      <>
                        {p.name} —{' '}
                        <Link href={`/products/${p.slug}/`} className="lp-link" {...L(C, 'sectionTexts.linesButton')}>
                          {t.linesButton}
                        </Link>
                      </>
                    ) : (
                      <Link href={`/products/${p.slug}/`} className="lp-link">
                        {p.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {t.primaryButton || t.secondaryButton ? (
            <div className="lp-actions">
              {t.primaryButton ? (
                <Link href="/contact/" className="lp-action" {...L(C, 'sectionTexts.primaryButton')}>
                  {t.primaryButton}
                </Link>
              ) : null}
              {t.secondaryButton ? (
                <Link href="/products/" className="lp-outline" {...L(C, 'sectionTexts.secondaryButton')}>
                  {t.secondaryButton}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </Section>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: ui.common.home, path: '/' },
          { name: settings.nav.cases, path: '/case-studies/' },
          { name: item.title, path: `/case-studies/${item.slug}/` },
        ])}
      />
    </>
  )
}
