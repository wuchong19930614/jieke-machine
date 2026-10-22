'use client'
// 右侧悬浮栏（技术方案 4.2）：邮箱、电话、联系我们、在线客服、返回顶部、在线沟通。
// 手机上六个按钮默认收起成一个“联系”按钮，点开后向上展开，避免整列按钮压住正文右侧（技术方案 4.6）
import { ChevronUp, Headset, Mail, MessageCircle, MessagesSquare, Phone, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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
  const { open: openOverlay, overlay } = useUi()
  // 手机上是否展开；桌面上始终全部显示，这个状态不起作用
  const [expanded, setExpanded] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const L = (key: keyof typeof FLOATING_TEXTS) => locate[key] ?? {}
  // 选了任一按钮就收起，弹层关闭后不会留着一整列按钮。
  // 收起后原按钮被隐藏，焦点无法回到它，所以手机上（展开按钮可见时）改为回到展开按钮
  const open: typeof openOverlay = (next, from) => {
    const toggle = toggleRef.current
    const returnTo = toggle && getComputedStyle(toggle).display !== 'none' ? toggle : from
    setExpanded(false)
    openOverlay(next, returnTo)
  }

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expanded])

  return (
    <aside className={`lp-floating-tools${expanded ? ' is-open' : ''}`} aria-label={texts.region}>
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
          setExpanded(false)
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
      {/* 只在手机上显示（样式控制）：收起时是唯一露出的按钮 */}
      <button
        ref={toggleRef}
        type="button"
        className="lp-float-toggle"
        aria-label={expanded ? texts.collapse : texts.expand}
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        {...L(expanded ? 'collapse' : 'expand')}
      >
        <Plus aria-hidden="true" />
      </button>
    </aside>
  )
}
