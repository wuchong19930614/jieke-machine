import Link from 'next/link'

import { fill } from '@/content/defineTexts'
import { PRODUCT_SECTIONS } from '@/lib/constants'
import { collectionDoc } from '@/lib/locate'
import type { LocateAttrs, Locator } from '@/lib/locator'
import { normalizeSpecTable, publicRows } from '@/lib/specTable'
import { whatsappLink } from '@/lib/whatsapp'
import type { Product } from '@/payload-types'

import { Img, mediaOf, pickRatio } from './Img'
import { linkHref, LinkTo } from './LinkTo'
import { orderedSections } from './Section'

export function StandaloneMachineCard({
  product,
  detailsText,
  detailsAttrs,
  whatsapp,
  whatsappTexts,
  L,
  draft,
}: {
  product: Product
  detailsText: string
  detailsAttrs: LocateAttrs
  whatsapp: string
  whatsappTexts: { message: string; productMessage: string }
  L: Locator
  draft: boolean
}) {
  const doc = collectionDoc('products', product.id)
  const href = `/products/${product.slug}/`
  const inquiry = orderedSections(product.sections, PRODUCT_SECTIONS).find(({ module }) => module === 'inquiry')
  const inquiryHref = inquiry && !['desktop', 'mobile'].includes(inquiry.background.device ?? '')
    ? `${href}#inquiry`
    : `/contact/?product=${encodeURIComponent(product.slug)}`
  const imageLink = linkHref(product.listLink, draft)
  const table = normalizeSpecTable(product.specTable)
  const specs = publicRows(table).filter(({ label }) => label).slice(0, 3)
  const materials = [...new Set((product.applications ?? [])
    .filter(({ visible }) => visible !== false)
    .map(({ name }) => name.trim())
    .filter(Boolean))]
  const message = fill(whatsappTexts.productMessage, { productName: product.name }) || whatsappTexts.message
  const image = (
    <Img
      media={product.listImage}
      ratio={pickRatio(product, 'listImage')}
      fit={product.listImageFit}
      defaultRatio="6/5"
      sizes="(max-width: 767px) 85vw, (max-width: 1300px) 36vw, 460px"
      attrs={L(doc, 'listImage')}
    />
  )

  return (
    <article className="lp-machine-card">
      {mediaOf(product.listImage) ? (
        imageLink ? (
          <LinkTo link={imageLink} className="lp-machine-image lp-image-link" label={product.name}>{image}</LinkTo>
        ) : (
          <Link href={href} className="lp-machine-image lp-image-link" tabIndex={-1} aria-hidden="true">{image}</Link>
        )
      ) : null}
      <div className="lp-machine-copy">
        <h2 {...L(doc, 'name')}><Link href={href}>{product.name}</Link></h2>
        {product.listSummary ? <p className="lp-machine-summary" {...L(doc, 'listSummary')}>{product.listSummary}</p> : null}
        {specs.length ? (
          <dl className="lp-machine-specs" {...L(doc, 'specTable')}>
            {specs.map(({ id, label, values }) => (
              <div key={id}>
                <dt>{label}</dt>
                <dd>{[...new Set(table.models.map(({ id }) => values[id]).filter(Boolean))].join(' / ')}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {materials.length ? (
          <ul className="lp-machine-materials" {...L(doc, 'applications')}>
            {materials.map((name) => <li key={name}>{name}</li>)}
          </ul>
        ) : null}
        <div className="lp-machine-actions">
          {detailsText ? <Link href={href} className="lp-machine-details" {...detailsAttrs}>{detailsText}</Link> : null}
          <Link href={inquiryHref} className="lp-machine-inquiry">Get Information</Link>
          {/\d/.test(whatsapp) ? (
            <a href={whatsappLink(whatsapp, message)} className="lp-machine-whatsapp" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
