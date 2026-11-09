// 生产线图文块：首页生产线和产品列表共用，蓝色背景上的白色图文块左右交替（技术方案 4.4）
import Link from 'next/link'
import type React from 'react'

import { collectionDoc } from '@/lib/locate'
import type { LocateAttrs, Locator } from '@/lib/locator'
import type { Product } from '@/payload-types'

import { Img, ownOrGroupFit, ownOrGroupRatio } from './Img'
import { linkHref, LinkTo } from './LinkTo'

// 产品列表页“列表图片设置”（第 9 点）；首页生产线不传，保持原样
export type LineLayout = {
  ratio?: string | null
  fit?: string | null
  width?: string | null
  position?: string | null
}

export function ProductLineCard({
  product,
  index,
  buttonText,
  buttonAttrs,
  L,
  ratio,
  headingLevel = 'h2',
  layout,
  draft,
}: {
  product: Product
  index: number
  buttonText: string
  // 按钮文字所在字段的定位标注（首页在首页配置，产品列表在界面文案）
  buttonAttrs?: LocateAttrs
  L: Locator
  ratio: string
  headingLevel?: 'h2' | 'h3'
  layout?: LineLayout
  // 预览模式：列表图跳转的目标产品 / 案例没发布时也显示链接
  draft: boolean
}) {
  const doc = collectionDoc('products', product.id)
  const href = `/products/${product.slug}/`
  const Heading = headingLevel
  // 图片在右边 = 交换两列：左右交替时单数行交换，“全部在右边”每行都交换
  const reverse = layout?.position === 'right' || ((layout?.position ?? 'alternate') === 'alternate' && index % 2 === 1)
  const width = ['40', '50', '60'].includes(layout?.width ?? '') ? Number(layout?.width) : null
  // 产品自己选了比例 / 适配方式时以产品为准，否则用列表页的统一设置
  const image = (
    <Img
      media={product.listImage}
      ratio={ownOrGroupRatio(product, 'listImage', layout?.ratio)}
      fit={ownOrGroupFit(product, 'listImage', layout?.fit)}
      defaultRatio={ratio}
      sizes={`(max-width: 767px) 100vw, ${width ? Math.round(1180 * (width / 100)) : 600}px`}
      attrs={L(doc, 'listImage')}
    />
  )
  // 列表图可在产品里另设跳转（如 1688 商品页）；默认进详情页，与标题、按钮重复所以不进键盘焦点顺序
  const custom = linkHref(product.listLink, draft)
  return (
    <article
      className={`lp-store-line${reverse ? ' lp-store-reverse' : ''}`}
      {...(width ? { 'data-image-width': width, style: { '--line-img': `${width}fr`, '--line-txt': `${100 - width}fr` } as React.CSSProperties } : {})}
    >
      {custom ? (
        <LinkTo link={custom} className="lp-image-link" label={product.name}>
          {image}
        </LinkTo>
      ) : (
        <Link href={href} tabIndex={-1} aria-hidden="true" className="lp-image-link">
          {image}
        </Link>
      )}
      <div>
        <Heading {...L(doc, 'name')}>
          <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
            {product.name}
          </Link>
        </Heading>
        {product.listSummary ? (
          <p className="lp-muted" {...L(doc, 'listSummary')}>
            {product.listSummary}
          </p>
        ) : null}
        {buttonText ? (
          <Link href={href} className="lp-link" {...buttonAttrs}>
            {buttonText}
          </Link>
        ) : null}
      </div>
    </article>
  )
}
