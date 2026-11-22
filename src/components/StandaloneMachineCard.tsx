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
  const card = product.standaloneCard
  const cardAttrs = (field: string, fallback?: LocateAttrs) => ({ ...fallback, ...L(doc, `standaloneCard.${field}`) })
  const title = card?.title?.trim() || product.name
  const summary = card?.summary?.trim() || product.listSummary
  const details = card?.detailsLabel?.trim() || (detailsText === 'View Details →' ? 'Learn More' : detailsText)
  const href = `/products/${product.slug}/`
  const inquiry = orderedSections(product.sections, PRODUCT_SECTIONS).find(({ module }) => module === 'inquiry')
  const inquiryHref = inquiry && !['desktop', 'mobile'].includes(inquiry.background.device ?? '')
    ? `${href}#inquiry`
    : `/contact/?product=${encodeURIComponent(product.slug)}`
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
  const cardImage = mediaOf(card?.image)
  const media = cardImage ?? product.listImage
  const image = (
    <Img
      media={media}
      ratio={cardImage ? pickRatio(card, 'image') : pickRatio(product, 'listImage')}
      fit={cardImage ? card?.imageFit : product.listImageFit}
      defaultRatio="original"
      sizes="(max-width: 767px) 90vw, (max-width: 1300px) 39vw, 490px"
      attrs={cardAttrs('image')}
    />
  )

  return (
    <article className="lp-machine-card">
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
          {details ? <Link href={href} className="lp-machine-details" {...cardAttrs('detailsLabel', card?.detailsLabel?.trim() ? undefined : detailsAttrs)}>{details}</Link> : null}
          <Link href={inquiryHref} className="lp-machine-inquiry" {...cardAttrs('inquiryLabel')}>{card?.inquiryLabel?.trim() || 'Get Information'}</Link>
          {/\d/.test(whatsapp) ? (
            <a href={whatsappLink(whatsapp, message)} className="lp-machine-whatsapp" target="_blank" rel="noopener noreferrer" {...cardAttrs('whatsappLabel')}>
              {card?.whatsappLabel?.trim() || 'WhatsApp'}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
