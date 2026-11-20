'use client'
// 首页 Banner 轮播（技术方案 4.3）：5 秒切换；悬停或键盘焦点时暂停；系统开启“减少动态效果”时不自动播放
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'

import { fill } from '@/content/defineTexts'
import type { LocateAttrs } from '@/lib/locator'

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

export function BannerCarousel({
  slides,
  texts,
  locate = {},
  className,
}: {
  slides: React.ReactNode[]
  texts: Texts
  locate?: Partial<Record<keyof Texts, LocateAttrs>>
  // 模块“显示在”对应的 class（第 2 点）
  className?: string
}) {
  const total = slides.length
  const [index, setIndex] = useState(0)
  const activeIndex = index % total || 0
  const [paused, setPaused] = useState(false)
  const [hovering, setHovering] = useState(false)
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
  const rootRef = useRef<HTMLElement>(null)

  const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total])

  useLayoutEffect(() => {
    const root = rootRef.current
    const active = root?.querySelector(`[data-slide-index="${activeIndex}"]`)
    const copy = active?.querySelector<HTMLElement>('.lp-banner-copy')
    if (!root || !copy) return

    const media = active?.querySelector<HTMLElement>('.lp-banner-slide')
    const controls = root.querySelector<HTMLElement>('.lp-banner-controls')
    const slider = controls?.querySelector<HTMLElement>('.lp-slider')
    const update = () => {
      // Keep the image in normal flow. Move the copy only if it and the controls need more room.
      const controlSpace = controls ? Math.max(48, slider?.offsetHeight ?? 0) + 12 : 0
      root.toggleAttribute('data-copy-below', !media || media.offsetHeight < copy.offsetHeight + 2 * controlSpace)
    }
    const observer = new ResizeObserver(update)
    observer.observe(copy)
    if (media) observer.observe(media)
    if (slider) observer.observe(slider)
    update()
    return () => observer.disconnect()
  }, [activeIndex, slides])

  useEffect(() => {
    if (total < 2 || paused || hovering || reducedMotion) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL)
    return () => window.clearInterval(timer)
  }, [total, paused, hovering, reducedMotion])

  // 首屏加载完后再加载其余 Banner 的图片（技术方案 4.3 第 4 条）。
  // 没轮到的幻灯片是隐藏的，懒加载的图片不会自己下载，切换过去时会先空白一下
  useEffect(() => {
    const root = rootRef.current
    if (!root || total < 2) return
    const warm = () =>
      root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager'
      })
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback
    // 最多等 1.5 秒空闲，尽量赶在第一次切换（5 秒）之前下载好
    const start = () => (idle ? idle.call(window, warm, { timeout: 1500 }) : window.setTimeout(warm, 500))
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => window.removeEventListener('load', start)
  }, [total])

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
      className={className ? `lp-hero ${className}` : 'lp-hero'}
      aria-roledescription="carousel"
      aria-label={texts.region}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(activeIndex - 1)
        if (e.key === 'ArrowRight') go(activeIndex + 1)
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          data-slide-index={i}
          role="group"
          aria-roledescription="slide"
          aria-label={fill(texts.slide, { n: i + 1, total })}
          aria-hidden={i !== activeIndex}
          inert={i !== activeIndex ? true : undefined}
          style={{ display: i === activeIndex ? 'contents' : 'none' }}
        >
          {slide}
        </div>
      ))}
      {total > 1 ? (
        <div className="lp-banner-controls">
          <button type="button" className="lp-banner-arrow lp-banner-prev" aria-label={texts.prev} onClick={() => go(activeIndex - 1)}>
            ‹
          </button>
          <button type="button" className="lp-banner-arrow lp-banner-next" aria-label={texts.next} onClick={() => go(activeIndex + 1)}>
            ›
          </button>
          <div className="lp-slider" role="group" aria-label={texts.controls}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className="lp-banner-dot"
                aria-label={fill(texts.goTo, { n: i + 1 })}
                aria-pressed={i === activeIndex}
                onClick={() => go(i)}
              />
            ))}
            <span className="lp-banner-count" {...locate.count}>
              {fill(texts.count, { n: activeIndex + 1, total })}
            </span>
            <button
              type="button"
              className="lp-banner-pause"
              aria-label={paused ? texts.playAria : texts.pauseAria}
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
              {...(paused ? locate.play : locate.pause)}
            >
              {paused ? texts.play : texts.pause}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
