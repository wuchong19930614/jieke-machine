import { ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { fill } from '@/content/defineTexts'
import { collectionDoc } from '@/lib/locate'
import type { LocateAttrs, Locator } from '@/lib/locator'
import { normalizeSpecTable, publicRows } from '@/lib/specTable'
import { whatsappLink } from '@/lib/whatsapp'
import type { Product } from '@/payload-types'

import { Img, mediaOf, ownOrGroupFit, pickRatio } from './Img'
import { linkHref, LinkTo } from './LinkTo'

export function ProductListCard({
  product,
  detailsText,
  detailsAttrs,
  whatsapp,
  whatsappTexts,
  L,
  draft,
  lineLayout,
}: {
  product: Product
  detailsText: string
  detailsAttrs: LocateAttrs
  whatsapp: string
  whatsappTexts: { message: string; productMessage: string }
  L: Locator
  draft: boolean
  lineLayout?: { ratio: string | null; fit?: string | null; width?: string | null; reverse: boolean }
}) {
  const doc = collectionDoc('products', product.id)
  const card = product.standaloneCard
  const cardAttrs = (field: string, fallback?: LocateAttrs) => ({ ...fallback, ...L(doc, `standaloneCard.${field}`) })
  const title = card?.title?.trim() || product.name
  const summary = card?.summary?.trim() || product.listSummary
  const details = card?.detailsLabel?.trim() || (detailsText === 'View Details →' ? 'Learn More' : detailsText)
  const href = `/products/${product.slug}/`
  const inquiryHref = `/contact/?product=${encodeURIComponent(product.slug)}#inquiry`
  const imageLink = linkHref(product.listLink, draft)
  const table = normalizeSpecTable(product.specTable)
  const preferredSpecs = (card?.specs ?? []).map(({ label, value }, index) => ({
    label: label?.trim(),
    value: value?.trim(),
    key: `card-${index}`,
    labelAttrs: cardAttrs(`specs.${index}.label`),
    valueAttrs: cardAttrs(`specs.${index}.value`),
  })).filter(({ label, value }) => label && value)
  const specs = preferredSpecs.length ? preferredSpecs : publicRows(table).filter(({ label }) => label).slice(0, 3).map(({ id, label, values }) => ({
    key: id,
    label,
    value: [...new Set(table.models.map((model) => values[model.id]).filter(Boolean))].join(' / '),
    labelAttrs: L(doc, 'specTable'),
    valueAttrs: L(doc, 'specTable'),
  }))
  const preferredMaterials = (card?.materials ?? []).map(({ label }, index) => ({
    label: label?.trim(), key: `card-${index}`, attrs: cardAttrs(`materials.${index}.label`),
  })).filter(({ label }) => label)
  const materials = preferredMaterials.length ? preferredMaterials : [...new Set((product.applications ?? [])
    .filter(({ visible }) => visible !== false)
    .map(({ name }) => name.trim())
    .filter(Boolean))].map((label) => ({ label, key: label, attrs: L(doc, 'applications') }))
  const message = fill(whatsappTexts.productMessage, { productName: product.name }) || whatsappTexts.message
  const productMessage = message.includes(product.name) ? message : [message, product.name].filter(Boolean).join('\n')
  const cardImage = mediaOf(card?.image)
  const media = cardImage ?? product.listImage
  const imageWidth = ['40', '50', '60'].includes(lineLayout?.width ?? '') ? Number(lineLayout?.width) : 43
  const columns = { '--card-image-share': `${imageWidth}fr`, '--card-copy-share': `${100 - imageWidth}fr` } as CSSProperties
  const ratio = cardImage ? pickRatio(card, 'image') : lineLayout ? lineLayout.ratio : pickRatio(product, 'listImage')
  const fit = cardImage ? card?.imageFit : ownOrGroupFit(product, 'listImage', lineLayout?.fit)
  const image = (
    <Img
      media={media}
      ratio={ratio}
      fit={fit}
      defaultRatio="original"
      sizes={`(max-width: 767px) 90vw, (max-width: 1300px) ${Math.round(imageWidth * .9)}vw, ${Math.round(1140 * imageWidth / 100)}px`}
      attrs={cardAttrs('image')}
    />
  )

  return (
    <article className="lp-machine-card" data-production-line={lineLayout ? '' : undefined} data-image-right={lineLayout?.reverse && mediaOf(media) ? '' : undefined} style={columns}>
      {mediaOf(media) ? (
        imageLink ? (
          <LinkTo link={imageLink} className="lp-machine-image lp-image-link" label={product.name}>{image}</LinkTo>
        ) : (
          <Link href={href} className="lp-machine-image lp-image-link" tabIndex={-1} aria-hidden="true">{image}</Link>
        )
      ) : null}
      <div className="lp-machine-copy">
        <h2 {...cardAttrs('title', card?.title?.trim() ? undefined : L(doc, 'name'))}><Link href={href}>{title}</Link></h2>
        {summary ? <p className="lp-machine-summary" {...cardAttrs('summary', card?.summary?.trim() ? undefined : L(doc, 'listSummary'))}>{summary}</p> : null}
        {specs.length ? (
          <dl className="lp-machine-specs">
            {specs.map(({ key, label, value, labelAttrs, valueAttrs }) => (
              <div key={key}>
                <dt {...labelAttrs}>{label}</dt>
                <dd {...valueAttrs}>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {materials.length ? (
          <ul className="lp-machine-materials">
            {materials.map(({ key, label, attrs }) => <li key={key} {...attrs}>{label}</li>)}
          </ul>
        ) : null}
        <div className="lp-machine-actions">
          {details ? (
            <Link href={href} className="lp-machine-details" {...cardAttrs('detailsLabel', card?.detailsLabel?.trim() ? undefined : detailsAttrs)}>
              <ArrowRight size={16} aria-hidden="true" />
              <span>{details}</span>
            </Link>
          ) : null}
          <Link href={inquiryHref} className="lp-machine-inquiry" {...cardAttrs('inquiryLabel')}>
            <FileText size={16} aria-hidden="true" />
            <span>{card?.inquiryLabel?.trim() || 'Get a Quote'}</span>
          </Link>
          {/\d/.test(whatsapp) ? (
            <a href={whatsappLink(whatsapp, productMessage)} className="lp-machine-whatsapp" target="_blank" rel="noopener noreferrer" {...cardAttrs('whatsappLabel')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2.5a9.5 9.5 0 0 0-8.3 14.1l-1.2 4.8 4.9-1.2A9.5 9.5 0 1 0 12 2.5Z" />
                <path d="M8.1 7.6c-.8.4-.9 1.4-.5 2.5 1 2.5 3.2 4.7 5.7 5.7 1.1.4 2.1.3 2.5-.5l.4-.9c.1-.3 0-.6-.3-.7l-1.8-.9a.6.6 0 0 0-.7.2l-.6.7c-1.5-.6-2.7-1.9-3.3-3.3l.7-.6a.6.6 0 0 0 .2-.7l-.9-1.8a.6.6 0 0 0-.7-.3Z" />
              </svg>
              <span>{card?.whatsappLabel?.trim() || 'WhatsApp'}</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
