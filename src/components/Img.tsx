// 图片组件：统一处理图框比例、适配方式、焦点和懒加载（技术方案 4.2）
import Image from 'next/image'

import type { LocateAttrs } from '@/lib/locator'
import type { Media } from '@/payload-types'

export type Fit = 'contain' | 'cover'

type Props = {
  media: Media | number | string | null | undefined
  ratio?: string | null
  fit?: string | null
  defaultRatio?: string
  defaultFit?: Fit
  sizes: string
  priority?: boolean
  className?: string
  attrs?: LocateAttrs
  alt?: string
}

// 本地存储时 Payload 返回带域名的图片地址；next/image 按相对路径读取本站图片（线上图片在 Blob 域名，不受影响）
export const imageSrc = (url: string): string => url.replace(/^https?:\/\/[^/]+(?=\/api\/cms\/media\/file\/)/, '')

export function mediaOf(value: unknown): Media | null {
  return value && typeof value === 'object' && 'url' in value && (value as Media).url ? (value as Media) : null
}

export function Img({ media, ratio, fit, defaultRatio = '4/3', defaultFit = 'contain', sizes, priority, className, attrs, alt }: Props) {
  const m = mediaOf(media)
  if (!m?.url) return null
  const effectiveRatio = ratio && ratio !== 'default' ? ratio : defaultRatio
  const objectFit: Fit = fit === 'contain' || fit === 'cover' ? fit : defaultFit
  const aspect =
    effectiveRatio === 'original' && m.width && m.height ? `${m.width} / ${m.height}` : effectiveRatio === 'original' ? '4 / 3' : effectiveRatio.replace('/', ' / ')
  const position = `${m.focalX ?? 50}% ${m.focalY ?? 50}%`
  return (
    <div className={`lp-frame ${className ?? ''}`} style={{ aspectRatio: aspect }} {...attrs}>
      <Image
        src={imageSrc(m.url)}
        alt={alt ?? m.alt ?? ''}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit, objectPosition: position }}
      />
    </div>
  )
}
