'use client'
// 右侧悬浮栏（技术方案 4.2）：邮箱、电话、联系我们、在线客服、返回顶部、在线沟通
import { ChevronUp, Headset, Mail, MessageCircle, MessagesSquare, Phone } from 'lucide-react'

import type { TextsOf } from '@/content/defineTexts'
import type { FLOATING_TEXTS } from '@/content/texts'
import { track } from '@/lib/client/analytics'
import type { LocateAttrs } from '@/lib/locator'

import { useUi } from './UiProvider'

type Props = {
  texts: TextsOf<typeof FLOATING_TEXTS>
  hasEmail: boolean
  hasPhone: boolean
  locate?: Partial<Record<keyof typeof FLOATING_TEXTS, LocateAttrs>>
}

export function FloatingTools({ texts, hasEmail, hasPhone, locate = {} }: Props) {
  const { open, overlay } = useUi()
  const L = (key: keyof typeof FLOATING_TEXTS) => locate[key] ?? {}
  return (
    <aside className="lp-floating-tools" aria-label={texts.region}>
      {hasEmail ? (
        <button type="button" aria-label={texts.email} onClick={(e) => open('email', e.currentTarget)} {...L('email')}>
          <Mail aria-hidden="true" />
          <span>{texts.email}</span>
        </button>
      ) : null}
      {hasPhone ? (
        <button type="button" aria-label={texts.phone} onClick={(e) => open('phone', e.currentTarget)} {...L('phone')}>
          <Phone aria-hidden="true" />
          <span>{texts.phone}</span>
        </button>
      ) : null}
      <button type="button" aria-label={texts.contact} onClick={(e) => open('contact', e.currentTarget)} {...L('contact')}>
        <MessageCircle aria-hidden="true" />
        <span>{texts.contact}</span>
      </button>
      <button
        type="button"
        aria-label={texts.chat}
        onClick={(e) => {
          track('open_chat', { entry: 'red' })
          open('chat', e.currentTarget)
        }}
        {...L('chat')}
      >
        <Headset aria-hidden="true" />
        <span>{texts.chat}</span>
      </button>
      <button
        type="button"
        className="lp-top-tool"
        aria-label={texts.top}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          document.getElementById('main')?.focus({ preventScroll: true })
        }}
        {...L('top')}
      >
        <ChevronUp aria-hidden="true" />
        <span>{texts.top}</span>
      </button>
      <button
        type="button"
        className="lp-blue-launch"
        aria-label={texts.blue}
        aria-expanded={overlay === 'blue'}
        aria-controls="lp-blue-panel"
        onClick={(e) => {
          track('open_chat', { entry: 'blue' })
          open('blue', e.currentTarget)
        }}
        {...L('blue')}
      >
        <MessagesSquare aria-hidden="true" />
        <span>{texts.blue}</span>
      </button>
    </aside>
  )
}
