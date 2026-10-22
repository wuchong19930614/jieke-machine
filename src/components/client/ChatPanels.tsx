'use client'
// 红色在线服务窗口与蓝色在线沟通面板（技术方案 4.5、7.2）
import { MessageCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { TextsOf } from '@/content/defineTexts'
import type { BLUE_PANEL_TEXTS, FORM_TEXTS, RED_PANEL_TEXTS } from '@/content/texts'
import { loadTawk, openTawkChat, type TawkApi } from '@/lib/client/tawk'
import type { Country } from '@/lib/countries'
import type { LocateAttrs } from '@/lib/locator'

import { Dialog } from './Dialog'
import { InquiryForm } from './InquiryForm'
import { useUi } from './UiProvider'

type ChatState = 'connecting' | 'online' | 'offline' | 'failed'

type RedProps = {
  texts: TextsOf<typeof RED_PANEL_TEXTS>
  form: TextsOf<typeof FORM_TEXTS>
  closeLabel: string
  countries: Country[]
  businessEmail: string
  tawk: { propertyId: string; widgetId: string }
  locate?: Partial<Record<keyof typeof RED_PANEL_TEXTS, LocateAttrs>>
  formLocate?: Partial<Record<keyof typeof FORM_TEXTS, LocateAttrs>>
  turnstileSiteKey?: string
}

export function RedChat({ texts, form, closeLabel, countries, businessEmail, tawk, locate = {}, formLocate, turnstileSiteKey }: RedProps) {
  const { overlay, close, open } = useUi()
  const isOpen = overlay === 'chat'
  const [loadState, setState] = useState<ChatState>('connecting')
  const configured = Boolean(tawk.propertyId && tawk.widgetId)
  // 没有配置 tawk.to 时直接按离线处理
  const state: ChatState = configured ? loadState : 'offline'
  const [api, setApi] = useState<TawkApi | null>(null)
  const [opening, setOpening] = useState(false)
  const L = (key: keyof typeof RED_PANEL_TEXTS) => locate[key] ?? {}

  useEffect(() => {
    if (!isOpen || !configured) return
    let cancelled = false
    loadTawk(tawk.propertyId, tawk.widgetId)
      .then((loaded) => {
        if (cancelled) return
        setApi(loaded)
        // away（暂时离开）按离线处理（英文界面文案第二十一章第 1 项）
        setState(loaded.getStatus?.() === 'online' ? 'online' : 'offline')
        loaded.onStatusChange = (status) => setState(status === 'online' ? 'online' : 'offline')
      })
      .catch(() => !cancelled && setState('failed'))
    return () => {
      cancelled = true
    }
  }, [isOpen, configured, tawk.propertyId, tawk.widgetId])

  const statusKey = state === 'connecting' ? 'connecting' : state === 'online' ? 'onlineStatus' : 'offlineStatus'
  const statusText = texts[statusKey]

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      onReveal={() => open('chat')}
      className="lp-tool-dialog lp-chat-dialog"
      labelledBy="lp-chat-title"
      closeLabel={closeLabel}
      hideCloseButton
    >
      <header className="lp-chat-header">
        <div>
          <h3 id="lp-chat-title" {...L('title')}>
            {texts.title}
          </h3>
          <small aria-live="polite" {...L(statusKey)}>
            <span className={`lp-status-dot${state === 'online' ? ' is-online' : ''}`} aria-hidden="true" />
            {statusText}
          </small>
        </div>
        <button type="button" aria-label={closeLabel} onClick={close}>
          ×
        </button>
      </header>
      <div className="lp-chat-body">
        <div className="lp-chat-welcome" {...L('welcome')}>
          {texts.welcome}
        </div>
        {state === 'connecting' ? <p {...L('connecting')}>{texts.connecting}</p> : null}
        {state === 'online' ? (
          <div className="lp-chat-online">
            <p {...L('onlineText')}>{texts.onlineText}</p>
            <button
              type="button"
              className="lp-chat-start"
              disabled={opening}
              {...L('startChat')}
              onClick={() => {
                if (!api) return
                setOpening(true)
                openTawkChat(api, 'red')
                close()
                setOpening(false)
              }}
            >
              {opening ? texts.opening : texts.startChat}
            </button>
            <p className="lp-small-note" {...L('chatPrivacy')}>
              {texts.chatPrivacy}
            </p>
          </div>
        ) : null}
        {state === 'offline' || state === 'failed' ? (
          <div>
            <p {...L(state === 'failed' ? 'failedText' : 'offlineText')}>{state === 'failed' ? texts.failedText : texts.offlineText}</p>
            <h3 {...L('formTitle')}>{texts.formTitle}</h3>
            <InquiryForm source="offline_message" variant="chat" texts={form} countries={countries} businessEmail={businessEmail} locate={formLocate} turnstileSiteKey={turnstileSiteKey} />
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}

type BlueProps = {
  texts: TextsOf<typeof BLUE_PANEL_TEXTS>
  companyName: string
  logoUrl?: string | null
  tawk: { propertyId: string; widgetId: string }
  locate?: Partial<Record<keyof typeof BLUE_PANEL_TEXTS, LocateAttrs>>
  brandLocate?: { companyName?: LocateAttrs; logo?: LocateAttrs }
}

export function BluePanel({ texts, companyName, logoUrl, tawk, locate = {}, brandLocate = {} }: BlueProps) {
  const { overlay, close, open } = useUi()
  const isOpen = overlay === 'blue'
  const [state, setState] = useState<'idle' | 'connecting' | 'failed'>('idle')
  const panelRef = useRef<HTMLElement>(null)
  const L = (key: keyof typeof BLUE_PANEL_TEXTS) => locate[key] ?? {}

  // 预览里定位到面板内的文字时先打开面板
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const reveal = () => open('blue')
    panel.addEventListener('jieke:reveal', reveal)
    return () => panel.removeEventListener('jieke:reveal', reveal)
  }, [open])

  const enter = useCallback(async () => {
    setState('connecting')
    try {
      const api = await loadTawk(tawk.propertyId, tawk.widgetId)
      openTawkChat(api, 'blue')
      setState('idle')
      close()
    } catch {
      setState('failed')
    }
  }, [tawk.propertyId, tawk.widgetId, close])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  return (
    <section
      className="lp-blue-panel"
      id="lp-blue-panel"
      aria-label={texts.ariaLabel}
      hidden={!isOpen}
      ref={panelRef}
    >
      <button type="button" className="lp-blue-close" aria-label={texts.closeLabel} onClick={close}>
        ×
      </button>
      <div className="lp-blue-welcome">
        <div className="lp-blue-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logoUrl ? <img src={logoUrl} alt="" {...brandLocate.logo} /> : null}
          <strong {...brandLocate.companyName}>{companyName}</strong>
        </div>
        <h2 {...L('welcome')}>{texts.welcome}</h2>
        <div className="lp-blue-entry">
          <div className="lp-blue-avatar" {...brandLocate.companyName}>
            {companyName}
          </div>
          <button type="button" className="lp-blue-enter" disabled={state === 'connecting'} onClick={enter} {...L('enterChat')}>
            <MessageCircle aria-hidden="true" size={18} /> {state === 'connecting' ? texts.connecting : texts.enterChat}
          </button>
          <p className="lp-small-note" {...L('privacy')}>
            {texts.privacy}
          </p>
          {state === 'failed' ? (
            <div role="alert">
              <p className="lp-small-note" {...L('failedText')}>
                {texts.failedText}
              </p>
              <button type="button" className="lp-outline" onClick={(e) => open('contact', e.currentTarget)} {...L('failedButton')}>
                {texts.failedButton}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
