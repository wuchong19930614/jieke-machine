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

function CopyButton({ value, texts }: { value: string; texts: Common }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="lp-outline"
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

export function InfoDialogs({ email, phone, texts }: { email: string; phone: string; texts: Common }) {
  const { overlay, close } = useUi()
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`
  return (
    <>
      <Dialog open={overlay === 'email'} onClose={close} className="lp-tool-dialog lp-info-dialog" labelledBy="lp-email-title" closeLabel={texts.close}>
        <h2 id="lp-email-title">{texts.emailTitle}</h2>
        <p className="lp-info-value">{email}</p>
        <div className="lp-actions">
          <a className="lp-action" href={`mailto:${email}`} onClick={() => track('click_email', { location: 'floating' })}>
            {texts.sendEmail}
          </a>
          <CopyButton value={email} texts={texts} />
        </div>
      </Dialog>
      <Dialog open={overlay === 'phone'} onClose={close} className="lp-tool-dialog lp-info-dialog" labelledBy="lp-phone-title" closeLabel={texts.close}>
        <h2 id="lp-phone-title">{texts.phoneTitle}</h2>
        <p className="lp-info-value">{phone}</p>
        <div className="lp-actions">
          <a className="lp-action" href={telHref} onClick={() => track('click_phone', { location: 'floating' })}>
            {texts.callNow}
          </a>
          <CopyButton value={phone} texts={texts} />
        </div>
      </Dialog>
    </>
  )
}

type ContactDialogProps = {
  title: string
  closeLabel: string
  form: TextsOf<typeof FORM_TEXTS>
  countries: Country[]
  businessEmail: string
  locate?: Partial<Record<keyof typeof FORM_TEXTS, LocateAttrs>>
}

export function ContactDialog({ title, closeLabel, form, countries, businessEmail, locate }: ContactDialogProps) {
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
      <h2 id="lp-contact-dialog-title">{title}</h2>
      <InquiryForm source="popup" variant="popup" texts={form} countries={countries} businessEmail={businessEmail} locate={locate} />
    </Dialog>
  )
}
