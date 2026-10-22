'use client'
// 图片放大：全景图、流程图、案例现场图可点击放大（技术方案 4.2），多张时可前后切换
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { fill } from '@/content/defineTexts'

import { useBackdropClose } from './Dialog'

type Item = { src: string; alt: string; caption?: string | null; width?: number | null; height?: number | null }
type Ctx = { show: (items: Item[], index: number) => void }

const LightboxContext = createContext<Ctx | null>(null)

type Texts = { close: string; prevImage: string; nextImage: string; imageCount: string }

export function LightboxProvider({ texts, children }: { texts: Texts; children: React.ReactNode }) {
  const [state, setState] = useState<{ items: Item[]; index: number } | null>(null)
  const ref = useRef<HTMLDialogElement>(null)
  const show = useCallback((items: Item[], index: number) => setState({ items, index }), [])
  const close = useCallback(() => setState(null), [])
  const backdrop = useBackdropClose(ref, close)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (state && !dialog.open) dialog.showModal()
    if (!state && dialog.open) dialog.close()
  }, [state])

  const move = (delta: number) =>
    setState((s) => (s ? { ...s, index: (s.index + delta + s.items.length) % s.items.length } : s))
  const item = state ? state.items[state.index] : null

  return (
    <LightboxContext.Provider value={{ show }}>
      {children}
      <dialog
        ref={ref}
        className="lp-lightbox"
        aria-label={item?.alt || 'Image'}
        onClose={() => setState(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') move(-1)
          if (e.key === 'ArrowRight') move(1)
        }}
        {...backdrop}
      >
        {item ? (
          <>
            {/* 放大层直接显示原图，按比例完整展示 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.alt} />
            <div className="lp-lightbox__bar">
              <span>{item.caption}</span>
              <span>
                {state && state.items.length > 1 ? (
                  <>
                    <button type="button" onClick={() => move(-1)}>
                      {texts.prevImage}
                    </button>{' '}
                    {fill(texts.imageCount, { n: state.index + 1, total: state.items.length })}{' '}
                    <button type="button" onClick={() => move(1)}>
                      {texts.nextImage}
                    </button>{' '}
                  </>
                ) : null}
                <button type="button" onClick={() => setState(null)}>
                  {texts.close}
                </button>
              </span>
            </div>
          </>
        ) : null}
      </dialog>
    </LightboxContext.Provider>
  )
}

export function ZoomButton({
  items,
  index = 0,
  label,
  className,
  children,
}: {
  items: Item[]
  index?: number
  label: string
  className?: string
  children: React.ReactNode
}) {
  const ctx = useContext(LightboxContext)
  return (
    <button type="button" className={`lp-frame--zoom ${className ?? ''}`} aria-label={`${label}${items[index]?.alt ? `: ${items[index].alt}` : ''}`} onClick={() => ctx?.show(items, index)}>
      {children}
    </button>
  )
}
