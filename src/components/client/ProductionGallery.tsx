'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'

export function ProductionGallery({ title, items, labels }: { title: ReactNode; items: ReactNode[]; labels: { prev: string; next: string } }) {
  const track = useRef<HTMLDivElement>(null)
  const id = useId()
  const [active, setActive] = useState(0)

  function move(index: number) {
    const el = track.current
    const slide = el?.children.item(index)
    if (!el || !slide) return
    const offset = slide.getBoundingClientRect().left - el.getBoundingClientRect().left
    el.scrollTo({
      left: el.scrollLeft + offset - (el.clientWidth - slide.clientWidth) / 2,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  return (
    <>
      <div className="lp-production-heading">
        {title}
        {items.length > 1 ? (
          <div className="lp-production-controls">
            <button type="button" aria-label={labels.prev} aria-controls={id} disabled={active === 0} onClick={() => move(active - 1)}><ArrowLeft size={19} aria-hidden /></button>
            <span aria-live="polite">{active + 1} / {items.length}</span>
            <button type="button" aria-label={labels.next} aria-controls={id} disabled={active === items.length - 1} onClick={() => move(active + 1)}><ArrowRight size={19} aria-hidden /></button>
          </div>
        ) : null}
      </div>
      <div className="lp-production-track" id={id} ref={track} tabIndex={items.length > 1 ? 0 : undefined} onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        move(active + (event.key === 'ArrowLeft' ? -1 : 1))
      }} onScroll={(event) => {
        const el = event.currentTarget
        const center = el.getBoundingClientRect().left + el.clientWidth / 2
        const closest = Array.from(el.children).reduce((best, child, index) => {
          const box = child.getBoundingClientRect()
          const distance = Math.abs(box.left + box.width / 2 - center)
          return distance < best.distance ? { index, distance } : best
        }, { index: 0, distance: Infinity })
        setActive(closest.index)
      }}>
        {items}
      </div>
    </>
  )
}
