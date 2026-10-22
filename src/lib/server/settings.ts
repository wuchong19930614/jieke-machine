// 接口和定时任务里读取全站设置（不经过 React 缓存和草稿模式，始终读已发布内容）
import type { Payload } from 'payload'

import { withDefaults } from '@/content/defineTexts'
import { AUTO_REPLY_TEXTS, FORM_TEXTS } from '@/content/texts'
import type { SiteSetting } from '@/payload-types'

export async function getSettingsUncached(payload: Payload) {
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as SiteSetting
  return {
    companyName: settings.companyName ?? '',
    email: settings.email ?? '',
    phone: settings.phone ?? '',
    whatsapp: settings.whatsapp ?? '',
    notifyEmail: settings.notifyEmail ?? '',
    form: withDefaults(FORM_TEXTS, settings.formTexts),
    autoReply: withDefaults(AUTO_REPLY_TEXTS, settings.autoReply),
    turnstileEnabled: Boolean(settings.turnstileEnabled && settings.turnstileSiteKey),
  }
}
