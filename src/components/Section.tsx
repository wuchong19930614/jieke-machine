// 页面模块的外壳、标题和面包屑
import { getImageProps } from 'next/image'
import Link from 'next/link'
import React from 'react'

import { imageSrc, mediaOf } from '@/components/Img'
import { HEX_COLOR } from '@/lib/constants'
import { globalDoc } from '@/lib/locate'
import type { LocateAttrs, Locator } from '@/lib/locator'

const BG: Record<string, string> = { default: '', light: 'lp-bg-light', dark: 'lp-bg-dark', blue: 'lp-bg-blue' }

// 新增的预设色：颜色 + 深浅（深色背景套用 lp-bg-dark，文字变白）
const PRESETS: Record<string, [string, 'light' | 'dark']> = {
  cream: ['#faf6ef', 'light'],
  sky: ['#eaf2fb', 'light'],
  mint: ['#eaf5ee', 'light'],
  peach: ['#fdf0e8', 'light'],
  graphite: ['#22272e', 'dark'],
  forest: ['#16352c', 'dark'],
  orange: ['var(--lp-accent)', 'dark'],
  maroon: ['#7a1f1f', 'dark'],
}

export type BackgroundSpec = { value: string; color?: string | null; image?: unknown; overlay?: number | null; device?: string | null }

// “显示在”（第 2 点）→ 在另一类设备上隐藏的 class
export const deviceClass = (spec: BackgroundSpec | string | null | undefined): string => {
  const device = spec && typeof spec === 'object' ? spec.device : null
  return device === 'desktop' ? 'lp-only-desktop' : device === 'mobile' ? 'lp-only-mobile' : ''
}

// 按亮度判断自定义颜色是深是浅，决定文字用白色还是深色
function isDark(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b < 150
}

// 模块背景 → class 和内联样式。defaultClass 用于“默认”时本身就有底色的模块（如首页公司数据通栏）
export function backgroundProps(background: string | BackgroundSpec | null | undefined, defaultClass = ''): { className: string; style?: React.CSSProperties } {
  const spec: BackgroundSpec = typeof background === 'string' || !background ? { value: background || 'default' } : background
  const result = backgroundOnly(spec, defaultClass)
  const device = deviceClass(spec)
  return device ? { ...result, className: [result.className, device].filter(Boolean).join(' ') } : result
}

function backgroundOnly(spec: BackgroundSpec, defaultClass: string): { className: string; style?: React.CSSProperties } {
  const media = mediaOf(spec.image)
  if (media?.url) {
    const overlay = Math.min(90, Math.max(0, spec.overlay ?? 40)) / 100
    // 背景图也走图片优化（压缩成 AVIF / WebP、限制尺寸），不直接用上传的原图：普通屏 1920 宽，高清屏 3840 宽。
    // 用带前缀的 -webkit-image-set：iOS / Safari 16 及更早只认这个写法，Chrome、Edge、Firefox 和新版 Safari 也都支持；
    // 写成标准的 image-set() 时旧版 Safari 会丢掉整条背景（连遮罩一起）
    const { srcSet } = getImageProps({ src: imageSrc(media.url), alt: '', width: 1920, height: Math.round(1920 * ((media.height ?? 1080) / (media.width ?? 1920))) }).props
    const set = (srcSet ?? '')
      .split(', ')
      .map((entry) => entry.trim().split(' '))
      .filter(([url, density]) => url && density)
      .map(([url, density]) => `url("${url}") ${density}`)
      .join(', ')
    return {
      className: 'lp-bg-dark lp-bg-custom lp-bg-image',
      style: {
        '--section-image': `linear-gradient(rgb(10 25 40 / ${overlay}), rgb(10 25 40 / ${overlay})), ${set ? `-webkit-image-set(${set})` : `url("${imageSrc(media.url)}")`}`,
        '--section-image-position': `${media.focalX ?? 50}% ${media.focalY ?? 50}%`,
      } as React.CSSProperties,
    }
  }
  if (spec.value === 'custom') {
    const color = spec.color?.trim() ?? ''
    if (!HEX_COLOR.test(color)) return { className: defaultClass }
    return { className: `${isDark(color) ? 'lp-bg-dark' : 'lp-bg-light'} lp-bg-custom`, style: { background: color } }
  }
  const preset = PRESETS[spec.value]
  if (preset) return { className: `${preset[1] === 'dark' ? 'lp-bg-dark' : 'lp-bg-light'} lp-bg-custom`, style: { background: preset[0] } }
  if (spec.value === 'default') return { className: defaultClass }
  return { className: BG[spec.value] ?? '' }
}

export function Section({
  background = 'default',
  className,
  id,
  children,
  attrs,
}: {
  background?: string | BackgroundSpec | null
  className?: string
  id?: string
  children: React.ReactNode
  attrs?: LocateAttrs
}) {
  const bg = backgroundProps(background)
  return (
    <section id={id} className={['lp-section', bg.className, className].filter(Boolean).join(' ')} style={bg.style} {...attrs}>
      {children}
    </section>
  )
}

type Line = { text?: string | null; attrs?: LocateAttrs }

// 小标题、标题、副标题各自可能被隐藏，只输出有文字的部分；三项都没有时整块不输出
export function SectionTitle({ kicker, title, subtitle, as = 'h2' }: { kicker?: Line; title: Line; subtitle?: Line; as?: 'h1' | 'h2' }) {
  if (!kicker?.text && !title.text && !subtitle?.text) return null
  const Heading = as
  return (
    <div className="lp-title">
      {kicker?.text ? (
        <div className="lp-kicker" {...kicker.attrs}>
          {kicker.text}
        </div>
      ) : null}
      {title.text ? <Heading {...title.attrs}>{title.text}</Heading> : null}
      {subtitle?.text ? <p {...subtitle.attrs}>{subtitle.text}</p> : null}
    </div>
  )
}

export type Crumb = { href?: string; text: string; attrs?: LocateAttrs }

export function Breadcrumbs({ label, items }: { label: string; items: Crumb[] }) {
  return (
    <nav className="lp-breadcrumb" aria-label={label}>
      <ol>
        {items.map((item, i) => (
          <li key={`${item.text}-${i}`}>
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} {...item.attrs}>
                {item.text}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined} {...item.attrs}>
                {item.text}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// 面包屑前两级（首页、栏目）的定位：首页文字在界面文案，栏目名在全站设置的导航
export function crumbHome(text: string, L: Locator): Crumb {
  return { href: '/', text, attrs: L(globalDoc('ui-texts'), 'common.home') }
}

export function crumbNav(href: string, text: string, key: 'about' | 'products' | 'cases' | 'contact', L: Locator): Crumb {
  return { href, text, attrs: L(globalDoc('site-settings'), `navLabels.${key}`) }
}

export function PageBanner({
  breadcrumb,
  title,
  subtitle,
  children,
}: {
  breadcrumb: React.ReactNode
  title: Line
  subtitle?: Line
  children?: React.ReactNode
}) {
  return (
    <div className="lp-page-banner">
      {breadcrumb}
      <h1 {...title.attrs}>{title.text}</h1>
      {subtitle?.text ? (
        <p className="lp-muted" {...subtitle.attrs}>
          {subtitle.text}
        </p>
      ) : null}
      {children}
    </div>
  )
}

// 按后台“模块顺序”排列模块：没勾选显示的不渲染；后台没有配置时按默认顺序
type SectionRow = {
  id?: string | null
  module?: string | null
  visible?: boolean | null
  device?: string | null
  background?: string | null
  backgroundColor?: string | null
  backgroundImage?: unknown
  backgroundOverlay?: number | null
}

// 返回要显示的模块（按后台顺序）。extra 是可重复插入的模块（首页的图片模块），
// 这些模块的内容就在行里，所以同时返回原始行 row 和它在后台列表里的序号 index（用于定位）
export function orderedSections<K extends string, R extends SectionRow = SectionRow, X extends string = never>(
  sections: R[] | null | undefined,
  defaults: readonly { value: K }[],
  // 从未保存过模块顺序时，背景与后台字段的默认值一致
  backgrounds: Partial<Record<K, string>> = {},
  extra: readonly X[] = [],
): { module: K | X; background: BackgroundSpec; row: R; index: number }[] {
  const list = (sections?.length ? sections : defaults.map((d) => ({ module: d.value, visible: true, background: backgrounds[d.value] ?? 'default' }))) as R[]
  const known = new Set<string>([...defaults.map((d) => d.value), ...extra])
  return list
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.module && known.has(row.module) && row.visible !== false)
    .map(({ row, index }) => ({
      module: row.module as K | X,
      background: { value: row.background || 'default', color: row.backgroundColor, image: row.backgroundImage, overlay: row.backgroundOverlay, device: row.device },
      row,
      index,
    }))
}

export const sectionIndex = (sections: { module?: string | null }[] | null | undefined, module: string): number =>
  Math.max(0, sections?.findIndex((s) => s.module === module) ?? 0)
