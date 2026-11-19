import { Img, mediaOf, pickRatio } from '@/components/Img'
import { ZoomButton } from '@/components/client/Lightbox'
import type { DocKey } from '@/lib/locate'
import type { Locator } from '@/lib/locator'
import type { Media } from '@/payload-types'

type PhotoRow = { id?: string | null; image?: unknown; caption?: string | null; imageFit?: string | null }
export type GalleryPhoto = { key: string; media: Media; caption?: string | null; ratio?: string | null; fit?: string | null; path?: string }

export function galleryPhotos(rows: PhotoRow[] | null | undefined, legacy: unknown[] = [], legacyRatio?: string | null, legacyFit?: string | null, captionFallback?: string): GalleryPhoto[] {
  const listed = (rows ?? []).flatMap((row, index): GalleryPhoto[] => {
    const media = mediaOf(row.image)
    return media ? [{
      key: row.id ?? `photo-${index}`, media, caption: row.caption?.trim() || media.caption || captionFallback,
      ratio: pickRatio(row, 'image'), fit: row.imageFit, path: `photos.${index}`,
    }] : []
  })
  const seen = new Set(listed.map(({ media }) => media.id))
  const remaining = legacy.flatMap((value, index): GalleryPhoto[] => {
    const media = mediaOf(value)
    if (!media || seen.has(media.id)) return []
    seen.add(media.id)
    return [{ key: `legacy-${index}-${media.id}`, media, caption: media.caption || captionFallback, ratio: legacyRatio, fit: legacyFit }]
  })
  return [...listed, ...remaining]
}

export function PhotoGallery({ photos, doc, basePath = '', L, zoomLabel, compact = false }: { photos: GalleryPhoto[]; doc: DocKey; basePath?: string; L: Locator; zoomLabel: string; compact?: boolean }) {
  if (!photos.length) return null
  const entries = photos.map(({ media, caption }) => ({ src: media.url!, alt: media.alt ?? '', caption, width: media.width, height: media.height }))
  return (
    <div className={`lp-photo-gallery${compact ? ' lp-photo-gallery--compact' : ''}`} data-photos={Math.min(photos.length, 3)}>
      {photos.map(({ key, media, caption, ratio, fit, path }, index) => {
        const field = path ? [basePath, path].filter(Boolean).join('.') : null
        return (
          <figure key={key}>
            <ZoomButton index={index} items={entries} label={zoomLabel}>
              <Img media={media} ratio={ratio} fit={fit} defaultRatio={photos.length === 1 ? 'original' : '8/5'} sizes="(max-width: 767px) 90vw, 460px" attrs={field ? L(doc, `${field}.image`) : undefined} />
            </ZoomButton>
            {caption ? <figcaption {...(field ? L(doc, `${field}.caption`) : {})}>{caption}</figcaption> : null}
          </figure>
        )
      })}
    </div>
  )
}
