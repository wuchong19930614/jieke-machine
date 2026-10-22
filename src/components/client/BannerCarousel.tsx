'use client'
// 首页 Banner 轮播（技术方案 4.3）：5 秒切换；悬停或键盘焦点时暂停；系统开启“减少动态效果”时不自动播放
import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { fill } from '@/content/defineTexts'

type Texts = {
  prev: string
  next: string
  region: string
  slide: string
  controls: string
  goTo: string
  count: string
  pause: string
  play: string
  pauseAria: string
  playAria: string
}

const INTERVAL = 5000
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function BannerCarousel({ slides, texts }: { slides: React.ReactNode[]; texts: Texts }) {
  const total = slides.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovering, setHovering] = useState(false)
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
  const rootRef = useRef<HTMLElement>(null)

  const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total])

  useEffect(() => {
    if (total < 2 || paused || hovering || reducedMotion) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL)
    return () => window.clearInterval(timer)
  }, [total, paused, hovering, reducedMotion])

  // 预览里定位到某张 Banner 的文字时切到那一张并暂停
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onReveal = (e: Event) => {
      const slide = (e.target as Element).closest<HTMLElement>('[data-slide-index]')
      if (slide) {
        setIndex(Number(slide.dataset.slideIndex))
        setPaused(true)
      }
    }
    root.addEventListener('jieke:reveal', onReveal)
    return () => root.removeEventListener('jieke:reveal', onReveal)
  }, [])

  if (total === 0) return null

  return (
    <section
      ref={rootRef}
      className="lp-hero"
      aria-roledescription="carousel"
      aria-label={texts.region}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1)
        if (e.key === 'ArrowRight') go(index + 1)
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          data-slide-index={i}
          role="group"
          aria-roledescription="slide"
          aria-label={fill(texts.slide, { n: i + 1, total })}
          aria-hidden={i !== index}
          inert={i !== index ? true : undefined}
          style={{ display: i === index ? 'contents' : 'none' }}
        >
          {slide}
        </div>
      ))}
      {total > 1 ? (
        <>
          <button type="button" className="lp-banner-arrow lp-banner-prev" aria-label={texts.prev} onClick={() => go(index - 1)}>
            ‹
          </button>
          <button type="button" className="lp-banner-arrow lp-banner-next" aria-label={texts.next} onClick={() => go(index + 1)}>
            ›
          </button>
          <div className="lp-slider" role="group" aria-label={texts.controls}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className="lp-banner-dot"
                aria-label={fill(texts.goTo, { n: i + 1 })}
                aria-pressed={i === index}
                onClick={() => go(i)}
              />
            ))}
            <span className="lp-banner-count">{fill(texts.count, { n: index + 1, total })}</span>
            <button
              type="button"
              className="lp-banner-pause"
              aria-label={paused ? texts.playAria : texts.pauseAria}
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? texts.play : texts.pause}
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
