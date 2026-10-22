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

// 先用剪贴板接口；非 HTTPS 或权限被拒时，用临时文本框再试一次。
// 文本框放在弹窗里：模态弹窗打开时，弹窗外的元素不能获得焦点，放到 body 下会复制失败
async function copyText(value: string, container: HTMLElement): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    // 继续用下面的方式
  }
  const area = document.createElement('textarea')
  area.value = value
  area.setAttribute('readonly', '')
  area.style.cssText = 'position:absolute;opacity:0;pointer-events:none'
  container.appendChild(area)
  area.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    area.remove()
  }
}

function CopyButton({ value, texts, locate }: { value: string; texts: Common; locate: CommonLocate }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const label = { idle: texts.copy, copied: texts.copied, failed: texts.copyFailed }[status]
  const attrs = { idle: locate.copy, copied: locate.copied, failed: locate.copyFailed }[status]
  return (
    <button
      type="button"
      className="lp-outline"
      {...attrs}
      onClick={async (e) => {
        const button = e.currentTarget
        const ok = await copyText(value, button.parentElement ?? button)
        setStatus(ok ? 'copied' : 'failed')
        // 复制失败时选中号码或邮箱，访客可以直接长按或按快捷键复制
        if (!ok) {
          const text = button.closest('dialog')?.querySelector('.lp-info-value')
          if (text) window.getSelection()?.selectAllChildren(text)
        }
        window.setTimeout(() => setStatus('idle'), ok ? 2000 : 4000)
      }}
    >
      {label}
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
