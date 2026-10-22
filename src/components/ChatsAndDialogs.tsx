// 全站弹层：悬浮栏、邮箱/电话弹层、联系弹窗、红色客服窗口、蓝色在线沟通、Cookie 设置
import { BLUE_PANEL_TEXTS, FLOATING_TEXTS, FORM_TEXTS, RED_PANEL_TEXTS, UI_COMMON, UI_COOKIE } from '@/content/texts'
import { getCountries } from '@/lib/countries'
import type { Settings, UiTexts } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import { locateGroup, type Locator } from '@/lib/locator'

import { BluePanel, RedChat } from './client/ChatPanels'
import { ContactDialog, InfoDialogs } from './client/ContactOverlays'
import { CookieSettings } from './client/CookieSettings'
import { FloatingTools } from './client/FloatingTools'

export function ChatsAndDialogs({ settings, ui, L }: { settings: Settings; ui: UiTexts; L: Locator }) {
  const S = globalDoc('site-settings')
  const U = globalDoc('ui-texts')
  const countries = getCountries()
  const formLocate = locateGroup(L, S, 'formTexts', FORM_TEXTS)
  const floatingLocate = locateGroup(L, S, 'floatingTools', FLOATING_TEXTS)
  const tawk = { propertyId: settings.tawkPropertyId, widgetId: settings.tawkWidgetId }
  return (
    <>
      <FloatingTools texts={settings.floating} hasEmail={Boolean(settings.email)} hasPhone={Boolean(settings.phone)} locate={floatingLocate} />
      <InfoDialogs
        email={settings.email}
        phone={settings.phone}
        texts={ui.common}
        locate={locateGroup(L, U, 'common', UI_COMMON)}
        valueLocate={{ email: L(S, 'email'), phone: L(S, 'phone') }}
      />
      <ContactDialog
        title={settings.floating.contact}
        titleLocate={floatingLocate.contact}
        closeLabel={ui.common.close}
        form={settings.form}
        countries={countries}
        businessEmail={settings.email}
        locate={formLocate}
        turnstileSiteKey={settings.turnstileSiteKey}
      />
      <RedChat
        texts={settings.redPanel}
        form={settings.form}
        closeLabel={ui.common.close}
        countries={countries}
        businessEmail={settings.email}
        tawk={tawk}
        locate={locateGroup(L, S, 'redPanel', RED_PANEL_TEXTS)}
        formLocate={formLocate}
        turnstileSiteKey={settings.turnstileSiteKey}
      />
      <BluePanel
        texts={settings.bluePanel}
        companyName={settings.companyName}
        logoUrl={settings.logo?.url}
        tawk={tawk}
        privacyLink={settings.form.privacyLinkText}
        locate={locateGroup(L, S, 'bluePanel', BLUE_PANEL_TEXTS)}
        brandLocate={{ companyName: L(S, 'companyName'), logo: L(S, 'logo') }}
      />
      <CookieSettings texts={ui.cookie} closeLabel={ui.common.close} locate={locateGroup(L, U, 'cookie', UI_COOKIE)} />
    </>
  )
}
