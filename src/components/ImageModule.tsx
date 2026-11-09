// 首页“图片模块”和“图片网格”（第 1、3 点）：电脑图 / 手机图分开，高度可设，整张图可设链接
import { getImageProps } from 'next/image'
import React from 'react'

import type { DocKey } from '@/lib/locate'
import type { Locator } from '@/lib/locator'
import type { Media } from '@/payload-types'

import { imageSrc, mediaOf } from './Img'
import { linkHref, LinkTo, type LinkValue } from './LinkTo'
import { type BackgroundSpec, Section } from './Section'

type MediaRef = Media | number | null | undefined
type GridItem = { id?: string | null; image?: MediaRef; mobileImage?: MediaRef; link?: LinkValue }
export type ImageModuleRow = {
  id?: string | null
  module?: string | null
  desktopImage?: MediaRef
  mobileImage?: MediaRef
  height?: number | null
  mobileHeight?: number | null
  imageWidth?: string | null
  columns?: string | null
  mobileColumns?: string | null
  link?: LinkValue
  gridItems?: GridItem[] | null
}

const px = (value: number | null | undefined) => (typeof value === 'number' && value >= 80 && value <= 1200 ? `${Math.round(value)}px` : undefined)

// 电脑图和手机图放在同一个 <picture> 里，浏览器按屏幕宽度只下载其中一张。
// mobileSizes 是手机上的显示宽度：<source> 要单独写 sizes，不写时浏览器按 100vw 选图，网格里会下载偏大的图
function Picture({ desktop, mobile, sizes, mobileSizes }: { desktop: Media; mobile: Media | null; sizes: string; mobileSizes: string }) {
  const d = getImageProps({ src: imageSrc(desktop.url!), alt: desktop.alt ?? '', width: desktop.width ?? 1600, height: desktop.height ?? 900, sizes, quality: 80 }).props
  const m = mobile?.url ? getImageProps({ src: imageSrc(mobile.url), alt: '', width: mobile.width ?? 800, height: mobile.height ?? 1200, sizes: mobileSizes, quality: 75 }).props : null
  return (
    <picture>
      {m ? <source media="(max-width: 767px)" srcSet={m.srcSet} sizes={mobileSizes} width={m.width} height={m.height} /> : null}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt 已在 props 里（取媒体库的替代文字） */}
      <img
        {...d}
        loading="lazy"
        style={
          {
            '--focal': `${desktop.focalX ?? 50}% ${desktop.focalY ?? 50}%`,
            '--focal-mobile': `${(mobile ?? desktop).focalX ?? 50}% ${(mobile ?? desktop).focalY ?? 50}%`,
          } as React.CSSProperties
        }
      />
    </picture>
  )
}

export function ImageModule({ row, index, background, doc, L, draft }: { row: ImageModuleRow; index: number; background: BackgroundSpec; doc: DocKey; L: Locator; draft: boolean }) {
  const full = row.imageWidth === 'full'
  const frame = { '--h': px(row.height), '--h-m': px(row.mobileHeight) } as React.CSSProperties
  const path = `sections.${index}`

  if (row.module === 'imageBanner') {
    const desktop = mediaOf(row.desktopImage)
    if (!desktop?.url) return null
    return (
      <Section background={background} className={`lp-image-module${full ? ' lp-image-module--full' : ''}`}>
        <LinkTo link={linkHref(row.link, draft)} className="lp-image-link" label={desktop.alt || undefined}>
          <div className="lp-image-frame" style={frame} {...L(doc, `${path}.desktopImage`)}>
            <Picture desktop={desktop} mobile={mediaOf(row.mobileImage)} sizes={full ? '100vw' : '(max-width: 1280px) 100vw, 1280px'} mobileSizes="100vw" />
          </div>
        </LinkTo>
      </Section>
    )
  }

  const items = (row.gridItems ?? []).map((item, i) => ({ item, i, media: mediaOf(item.image) })).filter(({ media }) => media?.url)
  if (!items.length) return null
  const columns = ['2', '3', '4'].includes(row.columns ?? '') ? Number(row.columns) : 3
  const mobileColumns = row.mobileColumns === '1' ? 1 : 2
  return (
    <Section background={background} className={`lp-image-module${full ? ' lp-image-module--full' : ''}`}>
      <div className="lp-image-grid-module" style={{ '--cols': columns, '--cols-m': mobileColumns } as React.CSSProperties}>
        {items.map(({ item, i, media }) => (
          <LinkTo key={item.id ?? i} link={linkHref(item.link, draft)} className="lp-image-link" label={media!.alt || undefined}>
            <div className="lp-image-frame" style={frame} {...L(doc, `${path}.gridItems.${i}.image`)}>
              <Picture
                desktop={media!}
                mobile={mediaOf(item.mobileImage)}
                sizes={`(max-width: 767px) ${Math.round(100 / mobileColumns)}vw, ${Math.round((full ? 1920 : 1280) / columns)}px`}
                mobileSizes={`${Math.round(100 / mobileColumns)}vw`}
              />
            </div>
          </LinkTo>
        ))}
      </div>
    </Section>
  )
}
