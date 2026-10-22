// 生产线图文块：首页生产线和产品列表共用，蓝色背景上的白色图文块左右交替（技术方案 4.4）
import Link from 'next/link'

import { collectionDoc } from '@/lib/locate'
import type { LocateAttrs, Locator } from '@/lib/locator'
import type { Product } from '@/payload-types'

import { Img } from './Img'

export function ProductLineCard({
  product,
  index,
  buttonText,
  buttonAttrs,
  L,
  ratio,
  headingLevel = 'h2',
}: {
  product: Product
  index: number
  buttonText: string
  // 按钮文字所在字段的定位标注（首页在首页配置，产品列表在界面文案）
  buttonAttrs?: LocateAttrs
  L: Locator
  ratio: string
  headingLevel?: 'h2' | 'h3'
}) {
  const doc = collectionDoc('products', product.id)
  const href = `/products/${product.slug}/`
  const Heading = headingLevel
  return (
    <article className={`lp-store-line${index % 2 ? ' lp-store-reverse' : ''}`}>
      <Link href={href} tabIndex={-1} aria-hidden="true">
        <Img
          media={product.listImage}
          ratio={product.listImageRatio}
          fit={product.listImageFit}
          defaultRatio={ratio}
          sizes="(max-width: 767px) 100vw, 600px"
          attrs={L(doc, 'listImage')}
        />
      </Link>
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
