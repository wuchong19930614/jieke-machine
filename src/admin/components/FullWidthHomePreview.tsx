'use client'

import { Button, LivePreviewWindow, useLivePreviewContext } from '@payloadcms/ui'
import type { EditViewProps } from 'payload'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { HOME_PREVIEW_REVEAL_EVENT, isLocateMessage, LOCATE_SOURCE } from '@/lib/locate'

export function FullWidthHomePreview() {
  const { setIsLivePreviewing, url } = useLivePreviewContext()
  if (!url) return null

  return (
    <Button
      buttonStyle="secondary"
      margin={false}
      onClick={() => setIsLivePreviewing(true)}
      size="small"
      type="button"
    >
      全宽预览
    </Button>
  )
}

export function FullWidthHomePreviewWindow(props: EditViewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pendingPath = useRef<string | null>(null)
  const { appIsReady, iframeRef, isLivePreviewing, setBreakpoint, setIsLivePreviewing, setZoom } = useLivePreviewContext()

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isLivePreviewing && !dialog.open) {
      setBreakpoint('responsive')
      setZoom(1)
      dialog.showModal()
    } else if (!isLivePreviewing && dialog.open) {
      dialog.close()
    }
  }, [isLivePreviewing, setBreakpoint, setZoom])

  useEffect(() => {
    const openAndReveal = (event: Event) => {
      const path = (event as CustomEvent<unknown>).detail
      if (typeof path !== 'string') return
      event.preventDefault()
      pendingPath.current = path
      setIsLivePreviewing(true)
    }
    window.addEventListener(HOME_PREVIEW_REVEAL_EVENT, openAndReveal)
    return () => window.removeEventListener(HOME_PREVIEW_REVEAL_EVENT, openAndReveal)
  }, [setIsLivePreviewing])

  useEffect(() => {
    const preview = iframeRef.current?.contentWindow
    if (!isLivePreviewing || !appIsReady || !preview || !pendingPath.current) return
    preview.postMessage({ source: LOCATE_SOURCE, action: 'reveal', doc: 'global:home-page', path: pendingPath.current }, window.location.origin)
    pendingPath.current = null
  }, [appIsReady, iframeRef, isLivePreviewing])

  useEffect(() => {
    if (!isLivePreviewing) return
    const locateInForm = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return
      if (!isLocateMessage(event.data) || event.data.action !== 'focus-field' || event.data.doc !== 'global:home-page') return
      // Release modal focus before the editor scrolls to and focuses the field.
      dialogRef.current?.close()
      setIsLivePreviewing(false)
    }
    window.addEventListener('message', locateInForm, true)
    return () => window.removeEventListener('message', locateInForm, true)
  }, [iframeRef, isLivePreviewing, setIsLivePreviewing])

  return (
    <dialog
      aria-label="首页全宽预览"
      className="jk-home-preview-dialog"
      ref={dialogRef}
      onClose={() => {
        pendingPath.current = null
        setIsLivePreviewing(false)
      }}
    >
      <button type="button" className="jk-home-preview-dialog__exit" onClick={() => setIsLivePreviewing(false)}>
        返回编辑
      </button>
      <LivePreviewWindow {...props} />
    </dialog>
  )
}
