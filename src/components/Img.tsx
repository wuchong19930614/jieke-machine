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

// 读取某个图片位置的图框比例；选了“自定义”时换成填写的宽高（如 5:4 → 5/4），没填好就回到按用途默认
export function pickRatio(doc: unknown, name: string): string | null {
  if (!doc || typeof doc !== 'object') return null
  const record = doc as Record<string, unknown>
  const ratio = record[`${name}Ratio`]
  if (ratio !== 'custom') return typeof ratio === 'string' ? ratio : null
  const match = String(record[`${name}RatioCustom`] ?? '').trim().match(/^(\d+(?:\.\d+)?)\s*[:：]\s*(\d+(?:\.\d+)?)$/)
  return match && Number(match[1]) > 0 && Number(match[2]) > 0 ? `${match[1]}/${match[2]}` : null
}

// 单张图片另选了比例 / 适配方式时以单张为准，否则用整组的统一设置（fallback）；都没选时回到按用途默认
export function ownOrGroupRatio(doc: unknown, name: string, fallback: string | null | undefined): string | null {
  const own = pickRatio(doc, name)
  return own && own !== 'default' ? own : (fallback ?? null)
}

export function ownOrGroupFit(doc: unknown, name: string, fallback: string | null | undefined): string | null {
  const own = doc && typeof doc === 'object' ? (doc as Record<string, unknown>)[`${name}Fit`] : null
  return typeof own === 'string' && own !== 'default' ? own : (fallback ?? null)
}

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
