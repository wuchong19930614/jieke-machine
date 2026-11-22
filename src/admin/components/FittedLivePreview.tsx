'use client'

import { LivePreviewWindow, useLivePreviewContext } from '@payloadcms/ui'
import type { EditViewProps } from 'payload'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

import { LOCATE_SOURCE, PREVIEW_REVEAL_EVENT, type LocateMessage } from '@/lib/locate'

type Reveal = Extract<LocateMessage, { action: 'reveal' }>

export function FittedLivePreview(props: EditViewProps) {
  const root = useRef<HTMLDivElement>(null)
  const pending = useRef<Reveal | null>(null)
  const [viewport, setViewport] = useState({ width: 0, height: 0, scale: 1 })
  const { appIsReady, breakpoint, iframeRef, isLivePreviewing, previewWindowType, setIsLivePreviewing } = useLivePreviewContext()
  const fitted = !breakpoint || breakpoint === 'responsive'

  useLayoutEffect(() => {
    const pane = root.current?.querySelector<HTMLElement>('.live-preview-window__main')
    if (!pane || !isLivePreviewing || !fitted) return

    const measure = () => {
      const width = window.innerWidth
      const { clientWidth: paneWidth, clientHeight: height } = pane
      if (!paneWidth || !width || !height) return
      const scale = Math.min(1, paneWidth / width)
      setViewport((current) => current.width === width && current.height === height && current.scale === scale
        ? current
        : { width, height, scale })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(pane)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [fitted, isLivePreviewing, previewWindowType])

  useEffect(() => {
    if (previewWindowType !== 'iframe') return
    const openAndReveal = (event: Event) => {
      const detail = (event as CustomEvent<Pick<Reveal, 'doc' | 'path'>>).detail
      if (!detail) return
      event.preventDefault()
      pending.current = { source: LOCATE_SOURCE, action: 'reveal', ...detail }
      setIsLivePreviewing(true)
    }
    window.addEventListener(PREVIEW_REVEAL_EVENT, openAndReveal)
    return () => window.removeEventListener(PREVIEW_REVEAL_EVENT, openAndReveal)
  }, [previewWindowType, setIsLivePreviewing])

  useEffect(() => {
    const frame = iframeRef.current?.contentWindow
    if (!isLivePreviewing || !appIsReady || !frame || !pending.current) return
    frame.postMessage(pending.current, window.location.origin)
    pending.current = null
  }, [appIsReady, iframeRef, isLivePreviewing])

  const dimensions = fitted && viewport.width > 0 ? {
    '--jk-preview-width': viewport.width + 'px',
    '--jk-preview-height': viewport.height / viewport.scale + 'px',
    '--jk-preview-display-height': viewport.height + 'px',
    '--jk-preview-scale': viewport.scale,
  } as CSSProperties : undefined

  return (
    <div ref={root} className="jk-fitted-preview" data-fitted={Boolean(dimensions)} style={dimensions}>
      <LivePreviewWindow {...props} />
    </div>
  )
}
