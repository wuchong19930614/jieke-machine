'use client'
// 邮箱 / 电话弹层与联系弹窗（技术方案 4.2）
import { useState } from 'react'

import type { TextsOf } from '@/content/defineTexts'
import type { FORM_TEXTS, UI_COMMON } from '@/content/texts'
import { track } from '@/lib/client/analytics'
import type { Country } from '@/lib/countries'
import type { LocateAttrs } from '@/lib/locator'

import { Dialog } from './Dialog'
import { InquiryForm } from './InquiryForm'
import { useUi } from './UiProvider'

type Common = TextsOf<typeof UI_COMMON>

type CommonLocate = Partial<Record<keyof Common, LocateAttrs>>

function CopyButton({ value, texts, locate }: { value: string; texts: Common; locate: CommonLocate }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="lp-outline"
      {...(copied ? locate.copied : locate.copy)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2000)
        } catch {
          // 浏览器不允许时忽略
        }
      }}
    >
      {copied ? texts.copied : texts.copy}
    </button>
  )
}

type InfoProps = {
  email: string
  phone: string
  texts: Common
  // 预览里的定位标注：弹层文字在界面文案，邮箱和电话在全站设置
  locate?: CommonLocate
  valueLocate?: { email?: LocateAttrs; phone?: LocateAttrs }
}

export function InfoDialogs({ email, phone, texts, locate = {}, valueLocate = {} }: InfoProps) {
  const { overlay, close, open } = useUi()
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`
  return (
    <>
      <Dialog
        open={overlay === 'email'}
        onClose={close}
        onReveal={() => open('email')}
        className="lp-tool-dialog lp-info-dialog"
        labelledBy="lp-email-title"
        closeLabel={texts.close}
      >
        <h2 id="lp-email-title" {...locate.emailTitle}>
          {texts.emailTitle}
        </h2>
        <p className="lp-info-value" {...valueLocate.email}>
          {email}
        </p>
        <div className="lp-actions">
          <a className="lp-action" href={`mailto:${email}`} onClick={() => track('click_email', { location: 'floating' })} {...locate.sendEmail}>
            {texts.sendEmail}
          </a>
          <CopyButton value={email} texts={texts} locate={locate} />
        </div>
      </Dialog>
      <Dialog
        open={overlay === 'phone'}
        onClose={close}
        onReveal={() => open('phone')}
        className="lp-tool-dialog lp-info-dialog"
        labelledBy="lp-phone-title"
        closeLabel={texts.close}
      >
        <h2 id="lp-phone-title" {...locate.phoneTitle}>
          {texts.phoneTitle}
        </h2>
        <p className="lp-info-value" {...valueLocate.phone}>
          {phone}
        </p>
        <div className="lp-actions">
          <a className="lp-action" href={telHref} onClick={() => track('click_phone', { location: 'floating' })} {...locate.callNow}>
            {texts.callNow}
          </a>
          <CopyButton value={phone} texts={texts} locate={locate} />
        </div>
      </Dialog>
    </>
  )
}

type ContactDialogProps = {
  title: string
  titleLocate?: LocateAttrs
  closeLabel: string
  form: TextsOf<typeof FORM_TEXTS>
  countries: Country[]
  businessEmail: string
  locate?: Partial<Record<keyof typeof FORM_TEXTS, LocateAttrs>>
  turnstileSiteKey?: string
}

export function ContactDialog({ title, titleLocate, closeLabel, form, countries, businessEmail, locate, turnstileSiteKey }: ContactDialogProps) {
  const { overlay, close, open } = useUi()
  return (
    <Dialog
      open={overlay === 'contact'}
      onClose={close}
      onReveal={() => open('contact')}
      className="lp-tool-dialog lp-contact-dialog"
      labelledBy="lp-contact-dialog-title"
      closeLabel={closeLabel}
    >
      <h2 id="lp-contact-dialog-title" {...titleLocate}>
        {title}
      </h2>
      <InquiryForm source="popup" variant="popup" texts={form} countries={countries} businessEmail={businessEmail} locate={locate} turnstileSiteKey={turnstileSiteKey} />
    </Dialog>
  )
}
