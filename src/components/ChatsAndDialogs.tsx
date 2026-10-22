// 全站弹层：悬浮栏、邮箱/电话弹层、联系弹窗、红色客服窗口、蓝色在线沟通、Cookie 设置
import { defaultsOf, type TextDefs } from '@/content/defineTexts'
import { BLUE_PANEL_TEXTS, FLOATING_TEXTS, FORM_TEXTS, RED_PANEL_TEXTS, UI_COOKIE } from '@/content/texts'
import { getCountries } from '@/lib/countries'
import type { Settings, UiTexts } from '@/lib/data'
import { type DocKey, globalDoc } from '@/lib/locate'
import type { LocateAttrs, Locator } from '@/lib/locator'

import { BluePanel, RedChat } from './client/ChatPanels'
import { ContactDialog, InfoDialogs } from './client/ContactOverlays'
import { CookieSettings } from './client/CookieSettings'
import { FloatingTools } from './client/FloatingTools'

// 为一组文案字段生成定位标注（只在预览时有内容）
function locateMap<T extends TextDefs>(L: Locator, doc: DocKey, group: string, defs: T): Partial<Record<keyof T, LocateAttrs>> {
  const result: Partial<Record<keyof T, LocateAttrs>> = {}
  for (const key of Object.keys(defaultsOf(defs)) as (keyof T)[]) {
    const attrs = L(doc, `${group}.${String(key)}`)
    if (attrs['data-locate']) result[key] = attrs
  }
  return result
}

export function ChatsAndDialogs({ settings, ui, L }: { settings: Settings; ui: UiTexts; L: Locator }) {
  const S = globalDoc('site-settings')
  const countries = getCountries()
  const formLocate = locateMap(L, S, 'formTexts', FORM_TEXTS)
  const tawk = { propertyId: settings.tawkPropertyId, widgetId: settings.tawkWidgetId }
  return (
    <>
      <FloatingTools texts={settings.floating} hasEmail={Boolean(settings.email)} hasPhone={Boolean(settings.phone)} locate={locateMap(L, S, 'floatingTools', FLOATING_TEXTS)} />
      <InfoDialogs email={settings.email} phone={settings.phone} texts={ui.common} />
      <ContactDialog
        title={settings.floating.contact}
        closeLabel={ui.common.close}
        form={settings.form}
        countries={countries}
        businessEmail={settings.email}
        locate={formLocate}
      />
      <RedChat
        texts={settings.redPanel}
        form={settings.form}
        closeLabel={ui.common.close}
        countries={countries}
        businessEmail={settings.email}
        tawk={tawk}
        locate={locateMap(L, S, 'redPanel', RED_PANEL_TEXTS)}
        formLocate={formLocate}
      />
      <BluePanel
        texts={settings.bluePanel}
        companyName={settings.companyName}
        logoUrl={settings.logo?.url}
        tawk={tawk}
        locate={locateMap(L, S, 'bluePanel', BLUE_PANEL_TEXTS)}
      />
      <CookieSettings texts={ui.cookie} closeLabel={ui.common.close} locate={locateMap(L, globalDoc('ui-texts'), 'cookie', UI_COOKIE)} />
    </>
  )
}
