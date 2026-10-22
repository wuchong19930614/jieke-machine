'use client'
// Cookie Settings 弹窗（技术方案 7.3、英文界面文案第十四章）
import Link from 'next/link'
import { useState } from 'react'

import type { TextsOf } from '@/content/defineTexts'
import type { UI_COOKIE } from '@/content/texts'
import { analyticsAllowed, setAnalyticsAllowed } from '@/lib/client/consent'
import type { LocateAttrs } from '@/lib/locator'

import { Dialog } from './Dialog'
import { useUi } from './UiProvider'

type Props = {
  texts: TextsOf<typeof UI_COOKIE>
  closeLabel: string
  locate?: Partial<Record<keyof typeof UI_COOKIE, LocateAttrs>>
}

export function CookieSettings({ texts, closeLabel, locate = {} }: Props) {
  const { overlay, close, open, toast } = useUi()
  const isOpen = overlay === 'cookie'
  const [analytics, setAnalytics] = useState(true)
  const L = (key: keyof typeof UI_COOKIE) => locate[key] ?? {}

  // 每次打开时读取当前保存的选择
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) setAnalytics(analyticsAllowed())
  }

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      onReveal={() => open('cookie')}
      className="lp-tool-dialog lp-cookie-dialog"
      labelledBy="lp-cookie-title"
      closeLabel={closeLabel}
    >
      <h2 id="lp-cookie-title" {...L('title')}>
        {texts.title}
      </h2>
      <p {...L('intro')}>{texts.intro}</p>
      <section className="lp-cookie-group">
        <header>
          <h3 {...L('necessaryTitle')}>{texts.necessaryTitle}</h3>
          <span className="lp-muted" {...L('necessaryStatus')}>
            {texts.necessaryStatus}
          </span>
        </header>
        <p {...L('necessaryText')}>{texts.necessaryText}</p>
      </section>
      <section className="lp-cookie-group">
        <header>
          <h3 {...L('analyticsTitle')}>{texts.analyticsTitle}</h3>
          <label className="lp-switch">
            <input type="checkbox" role="switch" checked={analytics} aria-label={texts.analyticsToggle} onChange={(e) => setAnalytics(e.target.checked)} />
            {analytics ? texts.on : texts.off}
          </label>
        </header>
        <p {...L('analyticsText')}>{texts.analyticsText}</p>
      </section>
      <section className="lp-cookie-group">
        <header>
          <h3 {...L('chatTitle')}>{texts.chatTitle}</h3>
          <span className="lp-muted" {...L('chatStatus')}>
            {texts.chatStatus}
          </span>
        </header>
        <p {...L('chatText')}>{texts.chatText}</p>
      </section>
      <p>
        <Link href="/cookie-notice/" className="lp-link" {...L('noticeLink')}>
          {texts.noticeLink}
        </Link>
      </p>
      <div className="lp-actions">
        <button
          type="button"
          className="lp-action"
          onClick={() => {
            setAnalyticsAllowed(analytics)
            close()
            toast(texts.saved)
          }}
          {...L('save')}
        >
          {texts.save}
        </button>
        <button type="button" className="lp-outline" onClick={close} {...L('cancel')}>
          {texts.cancel}
        </button>
      </div>
    </Dialog>
  )
}
