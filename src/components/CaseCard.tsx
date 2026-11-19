// 案例卡片：首页精选案例、案例列表、产品详情的客户案例块共用
import Link from 'next/link'

import { countryName } from '@/lib/countries'
import { collectionDoc } from '@/lib/locate'
import type { LocateAttrs, Locator } from '@/lib/locator'
import { youtubeId } from '@/lib/youtube'
import type { Case, Product } from '@/payload-types'

import { VideoEmbed } from './client/VideoEmbed'
import { Img, mediaOf, pickRatio } from './Img'
import { galleryPhotos, PhotoGallery } from './PhotoGallery'

type Props = {
  item: Case
  L: Locator
  buttonText: string
  // 按钮文字所在字段的定位标注（各页面来源不同，由调用处传入）
  buttonAttrs?: LocateAttrs
  ratio: string
  variant: 'featured' | 'list' | 'related'
  labels?: { country: string; equipment: string }
  photosLabel?: { text: string; attrs?: LocateAttrs }
  zoomLabel?: string
  videoTexts?: { playAria: string; videoError: string; watchOnYouTube: string; contactUs: string; opensNewTab: string }
  draft: boolean
}

export function CaseCard({ item, L, buttonText, buttonAttrs, ratio, variant, labels, photosLabel, zoomLabel, videoTexts, draft }: Props) {
  const doc = collectionDoc('cases', item.id)
  const href = `/case-studies/${item.slug}/`
  const video = variant === 'featured' ? youtubeId(item.videoUrl) : null
  const cover = mediaOf(item.videoCover) ?? mediaOf(item.coverImage)
  const photos = variant === 'featured' ? galleryPhotos(item.photos, item.gallery ?? [], pickRatio(item, 'gallery'), item.galleryFit, item.summary || item.title) : []
  const configuredCover = mediaOf(item.coverImage)
  const image = configuredCover ?? photos[0]?.media
  const displayedImage = video && videoTexts ? cover : image
  const photoCover = photos.find(({ media }) => media.id === displayedImage?.id)
  const extraPhotos = photos.filter(({ media }) => media.id !== displayedImage?.id)
  const caption = item.coverCaption || photoCover?.caption || item.summary || displayedImage?.caption
  const captionField = item.coverCaption ? 'coverCaption' : photoCover?.path ? `${photoCover.path}.caption` : 'summary'
  const equipment = (item.products ?? [])
    .filter((p): p is Product => typeof p === 'object' && Boolean(p) && (draft || p._status === 'published'))
    .map((p) => p.name)
    .join(', ')
  const equipmentText = item.equipmentConfiguration || equipment
  return (
    <article className={variant === 'featured' ? 'lp-case-card' : 'lp-product lp-case-card'}>
      {video && videoTexts ? (
        // 首页精选案例有视频时显示 16:9 封面，点击后在原位播放（技术方案 4.3）
        <VideoEmbed
          videoId={video}
          title={item.title}
          cover={cover?.url ? { url: cover.url, alt: cover.alt ?? '' } : null}
          texts={{ ...videoTexts, playAria: videoTexts.playAria.replace('{videoTitle}', item.title) }}
          sizes="(max-width: 767px) 100vw, 400px"
        />
      ) : (
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <Img
            media={image}
            ratio={configuredCover ? pickRatio(item, 'coverImage') : photoCover?.ratio}
            fit={configuredCover ? item.coverImageFit : photoCover?.fit}
            defaultRatio={ratio}
            defaultFit="cover"
            sizes="(max-width: 767px) 100vw, 400px"
            attrs={L(doc, !configuredCover && photoCover?.path ? `${photoCover.path}.image` : 'coverImage')}
          />
        </Link>
      )}
      <div className={variant === 'featured' ? 'lp-home-case-copy' : 'lp-product-body'}>
        <h3 {...L(doc, 'title')}>
          <Link href={href}>{item.title}</Link>
        </h3>
        {caption ? (
          <p className="lp-muted lp-case-description" {...L(doc, captionField)}>
            {caption}
          </p>
        ) : null}
        {labels && (item.country || equipmentText) ? (
          <div className="lp-params">
            {item.country ? (
              <span {...L(doc, 'country')}>
                <span>{labels.country}</span> <b>{countryName(item.country)}</b>
              </span>
            ) : null}
            {equipmentText ? (
              <span>
                <span>{labels.equipment}</span> <b {...L(doc, item.equipmentConfiguration ? 'equipmentConfiguration' : 'products')}>{equipmentText}</b>
              </span>
            ) : null}
          </div>
        ) : null}
        {buttonText ? (
          <Link href={href} className="lp-link" {...buttonAttrs}>
            {buttonText}
          </Link>
        ) : null}
      </div>
      {photosLabel && zoomLabel && extraPhotos.length ? (
        <details className="lp-case-gallery">
          <summary><span {...photosLabel.attrs}>{photosLabel.text}</span> <span>({extraPhotos.length})</span></summary>
          <PhotoGallery photos={extraPhotos} doc={doc} L={L} zoomLabel={zoomLabel} compact />
        </details>
      ) : null}
    </article>
  )
}
