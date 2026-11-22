// 联系我们（技术方案 3.3）：联系方式自动取全站设置
import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ContactForm } from '@/components/client/ContactForm'
import { InquiryForm } from '@/components/client/InquiryForm'
import { Img, pickRatio } from '@/components/Img'
import { Breadcrumbs, crumbHome, crumbNav, PageBanner, Section } from '@/components/Section'
import { withDefaults } from '@/content/defineTexts'
import { CONTACT_PAGE_TEXTS, FORM_TEXTS } from '@/content/texts'
import { getCountries } from '@/lib/countries'
import { getContactPage, getProducts, getSettings, getTheme, getUiTexts, isDraft } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import { getLocator, locateGroup, textStyleSheet } from '@/lib/locator'
import { breadcrumbJsonLd, buildMetadata, JsonLd } from '@/lib/seo'
import { defaultRatio } from '@/lib/theme'
import { whatsappLink } from '@/lib/whatsapp'

const G = globalDoc('contact-page')
const S = globalDoc('site-settings')

export async function generateMetadata(): Promise<Metadata> {
  const draft = await isDraft()
  const [settings, page] = await Promise.all([getSettings(draft), getContactPage(draft)])
  const t = withDefaults(CONTACT_PAGE_TEXTS, page)
  return buildMetadata({ settings, path: '/contact/', pageName: t.title, description: t.intro, seo: page.seo })
}

export default async function ContactPageView() {
  const draft = await isDraft()
  const [page, settings, ui, theme, products, L] = await Promise.all([
    getContactPage(draft),
    getSettings(draft),
    getUiTexts(draft),
    getTheme(draft),
    getProducts(draft),
    getLocator(),
  ])
  const t = withDefaults(CONTACT_PAGE_TEXTS, page)
  // 文字样式要在生成页面内容之前登记（见 lib/locator.ts）
  const textStyles = textStyleSheet(G, page)
  const samePhone = settings.phone && settings.whatsapp && settings.phone.replace(/\D/g, '') === settings.whatsapp.replace(/\D/g, '')
  const formProps = {
    texts: settings.form,
    countries: getCountries(),
    businessEmail: settings.email,
    turnstileSiteKey: settings.turnstileSiteKey,
    locate: locateGroup(L, S, 'formTexts', FORM_TEXTS),
  }

  return (
    <>
      {textStyles}
      <PageBanner
        breadcrumb={<Breadcrumbs label={ui.common.breadcrumb} items={[crumbHome(ui.common.home, L), crumbNav('/contact/', settings.nav.contact, 'contact', L)]} />}
        title={{ text: t.title, attrs: L(G, 'title') }}
      />
      <Section>
        <div className="lp-split lp-detail-main">
          <div>
            {t.kicker ? (
              <div className="lp-kicker" {...L(G, 'kicker')}>
                {t.kicker}
              </div>
            ) : null}
            {t.heading ? <h2 {...L(G, 'heading')}>{t.heading}</h2> : null}
            {t.intro ? (
              <p className="lp-muted" style={{ whiteSpace: 'pre-line' }} {...L(G, 'intro')}>
                {t.intro}
              </p>
            ) : null}
            {/* 需求书第五部分：联系页显示公司名称，取全站设置 */}
            {settings.companyName ? (
              <p className="lp-contact-company" {...L(S, 'companyName')}>
                {settings.companyName}
              </p>
            ) : null}
            <dl className="lp-contact-list">
              {settings.email ? (
                <div>
                  <dt {...L(G, 'emailLabel')}>{t.emailLabel}</dt>
                  <dd {...L(S, 'email')}>
                    <a href={`mailto:${settings.email}`} data-track="click_email" data-track-location="contact_page">
                      {settings.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {samePhone ? (
                <div>
                  <dt {...L(G, 'phoneWhatsappLabel')}>{t.phoneWhatsappLabel}</dt>
                  <dd {...L(S, 'phone')}>
                    <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} data-track="click_phone" data-track-location="contact_page">
                      {settings.phone}
                    </a>{' '}
                    ·{' '}
                    <a
                      href={whatsappLink(settings.whatsapp, settings.whatsappTexts.message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={ui.common.whatsappAria}
                      data-track="click_whatsapp"
                      data-track-location="contact_page"
                    >
                      WhatsApp
                    </a>
                  </dd>
                </div>
              ) : (
                <>
                  {settings.phone ? (
                    <div>
                      <dt {...L(G, 'phoneLabel')}>{t.phoneLabel}</dt>
                      <dd {...L(S, 'phone')}>
                        <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} data-track="click_phone" data-track-location="contact_page">
                          {settings.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {settings.whatsapp ? (
                    <div>
                      <dt {...L(G, 'whatsappLabel')}>{t.whatsappLabel}</dt>
                      <dd {...L(S, 'whatsapp')}>
                        <a
                          href={whatsappLink(settings.whatsapp, settings.whatsappTexts.message)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={ui.common.whatsappAria}
                          data-track="click_whatsapp"
                          data-track-location="contact_page"
                        >
                          {settings.whatsapp}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </>
              )}
              {settings.address ? (
                <div>
                  <dt {...L(G, 'addressLabel')}>{t.addressLabel}</dt>
                  <dd {...L(S, 'address')}>{settings.address}</dd>
                </div>
              ) : null}
              {settings.officeHours ? (
                <div>
                  <dt {...L(G, 'hoursLabel')}>{t.hoursLabel}</dt>
                  <dd {...L(S, 'officeHours')}>{settings.officeHours}</dd>
                </div>
              ) : null}
            </dl>
            <Img media={page.image} ratio={pickRatio(page, 'image')} fit={page.imageFit} defaultRatio={defaultRatio(theme, 'factory')} defaultFit="cover" sizes="(max-width: 767px) 100vw, 560px" attrs={L(G, 'image')} />
          </div>
          <div id="inquiry">
            {t.formTitle ? <h3 {...L(G, 'formTitle')}>{t.formTitle}</h3> : null}
            <Suspense fallback={<InquiryForm source="contact_page" {...formProps} />}>
              <ContactForm {...formProps} productNames={Object.fromEntries(products.map((p) => [p.slug, p.name]))} />
            </Suspense>
          </div>
        </div>
      </Section>
      <JsonLd data={breadcrumbJsonLd([{ name: ui.common.home, path: '/' }, { name: settings.nav.contact, path: '/contact/' }])} />
    </>
  )
}
