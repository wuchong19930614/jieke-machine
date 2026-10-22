// 全站公共组件：顶栏、页头、报价引导条、页脚、手机底部按钮条（技术方案 4.2）
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

import { fill } from '@/content/defineTexts'
import type { Settings, UiTexts } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import type { Locator } from '@/lib/locator'
import { OpenOverlayButton } from './client/UiProvider'
import { WhatsAppLink } from './client/WhatsAppLink'
import { SOCIAL_ICONS } from './SocialIcons'
import { SiteNav } from './client/SiteNav'

const S = globalDoc('site-settings')
const U = globalDoc('ui-texts')

type ChromeProps = { settings: Settings; ui: UiTexts; L: Locator }

export function TopBar({ settings, ui, L }: ChromeProps) {
  const email = fill(ui.topBar.email, { businessEmail: settings.email })
  const whatsapp = fill(ui.topBar.whatsapp, { whatsapp: settings.whatsapp })
  return (
    <div className="lp-top">
      {/* 标语被隐藏时保留空位，联系方式仍靠右 */}
      <span className="lp-top__tagline" {...(ui.topBar.tagline ? L(U, 'topBar.tagline') : {})}>
        {ui.topBar.tagline}
      </span>
      <span className="lp-top__contact">
        {email ? (
          <a href={`mailto:${settings.email}`} data-track="click_email" data-track-location="top_bar" {...L(S, 'email')}>
            {email}
          </a>
        ) : null}
        {whatsapp ? (
          <WhatsAppLink
            number={settings.whatsapp}
            message={settings.whatsappTexts.message}
            productMessage={settings.whatsappTexts.productMessage}
            aria-label={ui.common.whatsappAria}
            data-track="click_whatsapp"
            data-track-location="top_bar"
            {...L(S, 'whatsapp')}
          >
            {whatsapp}
          </WhatsAppLink>
        ) : null}
      </span>
    </div>
  )
}

export function SiteHeader({ settings, ui, L }: ChromeProps) {
  const items = [
    { href: '/', key: 'home' as const },
    { href: '/about/', key: 'about' as const },
    { href: '/products/', key: 'products' as const },
    { href: '/case-studies/', key: 'cases' as const },
    { href: '/contact/', key: 'contact' as const },
  ].map((item) => ({ href: item.href, label: settings.nav[item.key], locate: L(S, `navLabels.${item.key}`) }))
  return (
    <header className="lp-header">
      <Link href="/" className="lp-logo" aria-label={fill(ui.common.logoAlt, { companyName: settings.companyName }) || 'Home'} {...L(S, 'logo')}>
        {settings.logo?.url ? (
          // Logo 按原始比例显示，不需要图片优化
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.logo.url} alt="" width={settings.logo.width ?? undefined} height={settings.logo.height ?? undefined} />
        ) : null}
        {settings.companyName ? <span>{settings.companyName}</span> : null}
      </Link>
      <SiteNav items={items} texts={ui.common} menuLocate={L(U, 'common.menu')} />
    </header>
  )
}

export function ContactBand({ settings, L }: Omit<ChromeProps, 'ui'>) {
  const t = settings.contactBand
  // 标题、说明、按钮都隐藏时整条不显示
  if (!t.title && !t.text && !t.buttonText) return null
  return (
    <div className="lp-contact-band">
      <div>
        {t.title ? <h2 {...L(S, 'contactBand.title')}>{t.title}</h2> : null}
        {t.text ? <p {...L(S, 'contactBand.text')}>{t.text}</p> : null}
      </div>
      {t.buttonText ? (
        <Link href="/contact/" className="lp-action" {...L(S, 'contactBand.buttonText')}>
          {t.buttonText}
        </Link>
      ) : null}
    </div>
  )
}

const SOCIAL = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'linkedin', label: 'LinkedIn' },
] as const

export function SiteFooter({ settings, ui, L }: ChromeProps) {
  const f = ui.footer
  const year = new Date().getFullYear()
  const socials = SOCIAL.filter((s) => settings.social[s.key])
  const lines = [
    { key: 'email', text: fill(f.email, { businessEmail: settings.email }), href: `mailto:${settings.email}`, track: 'click_email' },
    { key: 'phone', text: fill(f.phone, { phone: settings.phone }), href: `tel:${settings.phone.replace(/[^\d+]/g, '')}`, track: 'click_phone' },
    { key: 'whatsapp', text: fill(f.whatsapp, { whatsapp: settings.whatsapp }), whatsapp: true },
    { key: 'address', text: fill(f.address, { address: settings.address }) },
  ].filter((line) => line.text)
  return (
    <footer className="lp-footer">
      <div className="lp-footer-grid">
        <div>
          {settings.companyName ? <h3 {...L(S, 'companyName')}>{settings.companyName}</h3> : null}
          {settings.footerIntro ? (
            <p className="lp-footer-intro" {...L(S, 'footerIntro')}>
              {settings.footerIntro}
            </p>
          ) : null}
        </div>
        <div>
          <h3 {...L(U, 'footer.quickLinks')}>{f.quickLinks}</h3>
          <ul>
            {(
              [
                ['/', 'home'],
                ['/about/', 'about'],
                ['/products/', 'products'],
                ['/case-studies/', 'cases'],
                ['/contact/', 'contact'],
              ] as const
            ).map(([href, key]) => (
              <li key={href}>
                <Link href={href} {...L(S, `navLabels.${key}`)}>
                  {settings.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 {...L(U, 'footer.contact')}>{f.contact}</h3>
          <ul>
            {lines.map((line) => (
              <li key={line.key} {...L(S, line.key)}>
                {line.whatsapp ? (
                  <WhatsAppLink
                    number={settings.whatsapp}
                    message={settings.whatsappTexts.message}
                    productMessage={settings.whatsappTexts.productMessage}
                    aria-label={ui.common.whatsappAria}
                    data-track="click_whatsapp"
                    data-track-location="footer"
                  >
                    {line.text}
                  </WhatsAppLink>
                ) : line.href ? (
                  <a href={line.href} data-track={line.track} data-track-location="footer">
                    {line.text}
                  </a>
                ) : (
                  <span style={{ whiteSpace: 'pre-line' }}>{line.text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        {socials.length ? (
          <div>
            <h3 {...L(U, 'footer.followUs')}>{f.followUs}</h3>
            <div className="lp-social">
              {socials.map(({ key, label }) => {
                const Icon = SOCIAL_ICONS[key]
                return (
                  <a key={key} href={settings.social[key]} target="_blank" rel="noopener noreferrer" aria-label={`${label} ${ui.common.opensNewTab}`} {...L(S, key)}>
                    <Icon />
                  </a>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
      <div className="lp-copyright">
        <span {...L(U, 'footer.copyright')}>{fill(f.copyright, { year, companyName: settings.companyName }) || `© ${year}`}</span>
        <span className="lp-legal">
          <Link href="/privacy-policy/" {...L(U, 'footer.privacyPolicy')}>
            {f.privacyPolicy}
          </Link>
          <Link href="/cookie-notice/" {...L(U, 'footer.cookieNotice')}>
            {f.cookieNotice}
          </Link>
          <OpenOverlayButton overlay="cookie" className="lp-footer-button" {...L(U, 'footer.cookieSettings')}>
            {f.cookieSettings}
          </OpenOverlayButton>
        </span>
      </div>
    </footer>
  )
}

export function MobileBar({ settings, ui, L, quoteHref = '/contact/' }: ChromeProps & { quoteHref?: string }) {
  return (
    <div className="lp-mobile-bar">
      <Link href={quoteHref} className="lp-action" {...L(U, 'mobileBar.quote')}>
        {ui.mobileBar.quote}
      </Link>
      {settings.whatsapp ? (
        <WhatsAppLink
          number={settings.whatsapp}
          message={settings.whatsappTexts.message}
          productMessage={settings.whatsappTexts.productMessage}
          className="lp-outline"
          aria-label={ui.common.whatsappAria}
          data-track="click_whatsapp"
          data-track-location="mobile_bar"
          {...L(U, 'mobileBar.whatsapp')}
        >
          <MessageCircle size={16} aria-hidden="true" /> {ui.mobileBar.whatsapp}
        </WhatsAppLink>
      ) : null}
    </div>
  )
}
