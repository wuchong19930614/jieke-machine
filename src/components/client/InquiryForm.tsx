'use client'
// 询盘表单：联系页、产品页、联系弹窗和离线留言共用（技术方案 4.5、6.1）
import { useRouter } from 'next/navigation'
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'

import type { TextsOf } from '@/content/defineTexts'
import { fill } from '@/content/defineTexts'
import type { FORM_TEXTS } from '@/content/texts'
import { readAttribution } from '@/lib/client/attribution'
import { loadTurnstile } from '@/lib/client/turnstile'
import type { InquirySource } from '@/lib/constants'
import type { Country } from '@/lib/countries'
import { type InquiryField, LIMITS, validateInquiry } from '@/lib/inquirySchema'
import type { LocateAttrs } from '@/lib/locator'

type FormTexts = TextsOf<typeof FORM_TEXTS>

type Props = {
  source: InquirySource
  texts: FormTexts
  countries: Country[]
  businessEmail: string
  product?: { id: number; name: string; code?: string | null } | null
  variant?: 'page' | 'popup' | 'chat'
  // 预览里给各文案加的定位标注（服务端算好后传入）
  locate?: Partial<Record<keyof FormTexts, LocateAttrs>>
  defaultProductModel?: string
  // 后台开启人机验证时传入 Site Key，没开启时为空
  turnstileSiteKey?: string
}

type Values = Record<InquiryField, string>
type TokenState = { token: string; expiresAt: number } | null

const EMPTY: Values = { name: '', email: '', country: '', phone: '', company: '', productModel: '', requirements: '' }
export const LEAD_KEY = 'jk_pending_lead'

function newSubmissionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const withFallback = (template: string, vars: Record<string, string>, fallback: string) => fill(template, vars) || fallback

export function InquiryForm({ source, texts, countries, businessEmail, product, variant = 'page', locate = {}, defaultProductModel, turnstileSiteKey }: Props) {
  const router = useRouter()
  const uid = useId().replace(/:/g, '')
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<Values>({ ...EMPTY, productModel: defaultProductModel ?? '' })
  const [errors, setErrors] = useState<Partial<Record<InquiryField, string>>>({})
  const [alert, setAlert] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const token = useRef<TokenState>(null)
  const tokenRequest = useRef<Promise<TokenState> | null>(null)
  const submissionId = useRef<string>(newSubmissionId())
  // 人机验证：和表单令牌一样，访客第一次操作表单时才加载（技术方案 4.5）
  const [captchaOn, setCaptchaOn] = useState(false)
  const captchaBox = useRef<HTMLDivElement>(null)
  const captchaWidget = useRef<string | null>(null)
  const captchaToken = useRef('')

  const showCompany = source !== 'offline_message'
  const showProduct = source === 'contact_page' || source === 'product_page'
  const countryOptional = source === 'offline_message'
  const L = (key: keyof FormTexts) => locate[key] ?? {}

  // 访客第一次点击或聚焦表单时才领取令牌（技术方案 6.5），不在页面打开时请求
  const ensureToken = async (): Promise<TokenState> => {
    if (token.current && token.current.expiresAt - Date.now() > 60_000) return token.current
    if (!tokenRequest.current) {
      tokenRequest.current = fetch('/api/form-token', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { token?: string; expiresIn?: number } | null) => {
          token.current = data?.token ? { token: data.token, expiresAt: Date.now() + (data.expiresIn ?? 7200) * 1000 } : null
          return token.current
        })
        .catch(() => null)
        .finally(() => {
          tokenRequest.current = null
        })
    }
    return tokenRequest.current
  }

  const activate = () => {
    void ensureToken()
    if (turnstileSiteKey && !captchaOn) setCaptchaOn(true)
  }

  useEffect(() => {
    if (!captchaOn || !turnstileSiteKey) return
    let cancelled = false
    loadTurnstile()
      .then((api) => {
        if (cancelled || !captchaBox.current) return
        captchaWidget.current = api.render(captchaBox.current, {
          sitekey: turnstileSiteKey,
          language: 'en',
          callback: (value) => {
            captchaToken.current = value
          },
          'expired-callback': () => {
            captchaToken.current = ''
          },
          'error-callback': () => {
            captchaToken.current = ''
          },
        })
      })
      .catch(() => {
        if (!cancelled) setAlert(texts.captchaFailed)
      })
    return () => {
      cancelled = true
      if (captchaWidget.current) window.turnstile?.remove(captchaWidget.current)
      captchaWidget.current = null
      captchaToken.current = ''
    }
  }, [captchaOn, turnstileSiteKey, texts.captchaFailed])

  // 验证结果只能用一次，提交失败后重新验证
  const resetCaptcha = () => {
    captchaToken.current = ''
    if (captchaWidget.current) window.turnstile?.reset(captchaWidget.current)
  }

  const set = (field: InquiryField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors((x) => ({ ...x, [field]: undefined }))
  }

  const focusFirstError = (fieldErrors: Partial<Record<InquiryField, string>>) => {
    const order: InquiryField[] = ['name', 'email', 'country', 'phone', 'company', 'productModel', 'requirements']
    const first = order.find((f) => fieldErrors[f])
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setAlert(null)
    const input = { source, ...values }
    const result = validateInquiry(input)
    if (!result.ok) {
      const mapped = Object.fromEntries(Object.entries(result.errors).map(([f, key]) => [f, texts[key]]))
      setErrors(mapped)
      setAlert(texts.errorSummary)
      focusFirstError(mapped)
      return
    }
    if (turnstileSiteKey && !captchaToken.current) {
      setCaptchaOn(true)
      setAlert(texts.captchaPrompt)
      return
    }
    setSubmitting(true)
    try {
      const formToken = await ensureToken()
      const attribution = readAttribution()
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          ...(product ? { productId: String(product.id) } : {}),
          pageUrl: window.location.href,
          landingPage: attribution.landingPage,
          referrer: attribution.referrer,
          ...(attribution.utm ? { utm: attribution.utm } : {}),
          submissionId: submissionId.current,
          formToken: formToken?.token ?? '',
          ...(turnstileSiteKey ? { turnstileToken: captchaToken.current } : {}),
          website: honeypot,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        inquiryRef?: string
        redirect?: string
        message?: string
        fields?: Partial<Record<InquiryField, string>>
      }
      if (res.ok && data.ok) {
        try {
          sessionStorage.setItem(
            LEAD_KEY,
            JSON.stringify({ ref: data.inquiryRef, source, productName: product?.name ?? '' }),
          )
        } catch {
          // 忽略
        }
        submissionId.current = newSubmissionId()
        router.push(data.redirect || '/thank-you/')
        return
      }
      resetCaptcha()
      if (data.fields) {
        setErrors(data.fields)
        focusFirstError(data.fields)
      }
      setAlert(
        data.message ||
          withFallback(texts.errServer, { businessEmail }, 'Sorry, we could not send your inquiry. Please try again later.'),
      )
    } catch {
      resetCaptcha()
      setAlert(texts.errNetwork)
    } finally {
      setSubmitting(false)
    }
  }

  const id = (field: string) => `${uid}-${field}`
  const errorId = (field: InquiryField) => (errors[field] ? `${id(field)}-error` : undefined)
  const fieldProps = (field: InquiryField) => ({
    id: id(field),
    name: field,
    value: values[field],
    onChange: set(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errorId(field),
  })
  const ErrorText = ({ field }: { field: InquiryField }) =>
    errors[field] ? (
      <span className="lp-field-error" id={`${id(field)}-error`}>
        {errors[field]}
      </span>
    ) : null

  const privacy = useMemo(() => {
    const note = texts.privacyNote
    const link = texts.privacyLinkText
    const index = link ? note.indexOf(link) : -1
    if (index < 0) return <>{note}</>
    return (
      <>
        {note.slice(0, index)}
        <a href="/privacy-policy/" target="_blank" rel="noopener">
          {link}
        </a>
        {note.slice(index + link.length)}
      </>
    )
  }, [texts.privacyNote, texts.privacyLinkText])

  useEffect(() => {
    setValues((v) => (defaultProductModel && !v.productModel ? { ...v, productModel: defaultProductModel } : v))
  }, [defaultProductModel])

  const label = (field: InquiryField, key: keyof FormTexts) => (
    <label htmlFor={id(field)} {...L(key)}>
      {key === 'countryLabel' && countryOptional ? texts.countryOptionalLabel : texts[key]}
    </label>
  )

  const nameField = (
    <div className="lp-field">
      {label('name', 'nameLabel')}
      <input {...fieldProps('name')} autoComplete="name" maxLength={LIMITS.name} placeholder={texts.namePlaceholder} required />
      <ErrorText field="name" />
    </div>
  )
  const emailField = (
    <div className="lp-field">
      {label('email', 'emailLabel')}
      <input {...fieldProps('email')} type="email" autoComplete="email" maxLength={LIMITS.email} placeholder={texts.emailPlaceholder} required />
      <ErrorText field="email" />
    </div>
  )
  const phoneField = (
    <div className="lp-field">
      {label('phone', 'phoneLabel')}
      <input {...fieldProps('phone')} type="tel" autoComplete="tel" maxLength={LIMITS.phone} placeholder={texts.phonePlaceholder} />
      <ErrorText field="phone" />
    </div>
  )
  const companyField = showCompany ? (
    <div className="lp-field">
      {label('company', 'companyLabel')}
      <input {...fieldProps('company')} autoComplete="organization" maxLength={LIMITS.company} placeholder={texts.companyPlaceholder} />
      <ErrorText field="company" />
    </div>
  ) : null
  const countryField = (
    <div className={`lp-field${variant === 'page' ? '' : ' lp-full'}`}>
      {label('country', 'countryLabel')}
      <select {...fieldProps('country')} autoComplete="country" required={!countryOptional}>
        <option value="">{texts.countryPlaceholder}</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <ErrorText field="country" />
    </div>
  )

  return (
    <form
      ref={formRef}
      className={`lp-form${variant === 'popup' ? ' lp-form--popup' : ''}`}
      noValidate
      onSubmit={onSubmit}
      onFocus={activate}
      onPointerDown={activate}
    >
      <p className="lp-form-note" {...L('requiredNote')}>
        {texts.requiredNote}
      </p>
      {product ? (
        <p className="lp-form-product" {...L('productPrefill')}>
          {fill(texts.productPrefill, { productName: product.name })}
        </p>
      ) : null}
      {variant === 'page' ? (
        <>
          {nameField}
          {emailField}
          {countryField}
          {phoneField}
          {companyField}
        </>
      ) : (
        <>
          {nameField}
          {phoneField}
          {emailField}
          {companyField}
          {countryField}
        </>
      )}
      {showProduct ? (
        <div className="lp-field lp-full">
          {label('productModel', 'productLabel')}
          <input
            {...fieldProps('productModel')}
            maxLength={LIMITS.productModel}
            placeholder={source === 'product_page' ? texts.productPagePlaceholder : texts.productPlaceholder}
          />
          <ErrorText field="productModel" />
        </div>
      ) : null}
      <div className="lp-field lp-full">
        {label('requirements', 'requirementsLabel')}
        <textarea {...fieldProps('requirements')} maxLength={LIMITS.requirements} placeholder={texts.requirementsPlaceholder} required />
        <ErrorText field="requirements" />
      </div>
      {/* 隐藏陷阱字段：真人看不到，机器人填了就不保存（技术方案 4.5） */}
      <div className="lp-hp" aria-hidden="true">
        <label htmlFor={id('website')}>{texts.honeypotLabel}</label>
        <input id={id('website')} name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      {turnstileSiteKey && captchaOn ? <div className="lp-full lp-captcha" ref={captchaBox} /> : null}
      {alert ? (
        <div className="lp-form-alert" role="alert">
          {alert}
        </div>
      ) : null}
      <div className={`lp-full${variant === 'popup' ? ' lp-submit-row' : ''}`}>
        <button
          type="submit"
          className={variant === 'chat' ? 'lp-chat-submit' : variant === 'popup' ? undefined : 'lp-action'}
          disabled={submitting}
          {...L(source === 'offline_message' ? 'submitMessage' : 'submitInquiry')}
        >
          {submitting ? texts.sending : source === 'offline_message' ? texts.submitMessage : texts.submitInquiry}
        </button>
      </div>
      <p className="lp-form-note" {...L('privacyNote')}>
        {privacy}
      </p>
    </form>
  )
}
