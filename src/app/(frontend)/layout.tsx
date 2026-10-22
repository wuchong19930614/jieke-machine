// 前台根布局：全站公共组件、主题变量、统计、弹层和预览工具
import type { Metadata, Viewport } from 'next'
import { Inter, Montserrat, Open_Sans } from 'next/font/google'
import React from 'react'

import { ChatsAndDialogs } from '@/components/ChatsAndDialogs'
import { Analytics } from '@/components/client/Analytics'
import { ErrorTextsProvider } from '@/components/client/ErrorTexts'
import { LightboxProvider } from '@/components/client/Lightbox'
import { PreviewTools } from '@/components/client/PreviewTools'
import { UiProvider } from '@/components/client/UiProvider'
import { ContactBand, MobileBar, SiteFooter, SiteHeader, TopBar } from '@/components/SiteChrome'
import { getSettings, getTheme, getUiTexts, isDraft } from '@/lib/data'
import { globalDoc } from '@/lib/locate'
import { getLocator } from '@/lib/locator'
import { siteUrl } from '@/lib/previewPath'
import { indexingAllowed, JsonLd, organizationJsonLd } from '@/lib/seo'
import { themeStyle } from '@/lib/theme'

import './globals.css'

// 字体随网站一起发布（构建时下载并自托管），只包含拉丁字符（技术方案 8.2 第 4 条）
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter', preload: false })
const montserrat = Montserrat({ subsets: ['latin'], display: 'swap', variable: '--font-montserrat', preload: false })
const openSans = Open_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-open-sans', preload: false })
const FONT_VARS = { inter: '--font-inter', montserrat: '--font-montserrat', 'open-sans': '--font-open-sans' }

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings(await isDraft())
  return {
    metadataBase: new URL(siteUrl()),
    robots: indexingAllowed(settings) ? undefined : { index: false, follow: true },
    icons: {
      icon: settings.favicon?.url ? [{ url: settings.favicon.url }] : undefined,
      apple: settings.appleTouchIcon?.url ? [{ url: settings.appleTouchIcon.url }] : undefined,
    },
  }
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#142e46' }

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const draft = await isDraft()
  const [settings, ui, theme, L] = await Promise.all([getSettings(draft), getUiTexts(draft), getTheme(draft), getLocator()])

  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${openSans.variable}`} style={themeStyle(theme, FONT_VARS)}>
      <body>
        <UiProvider>
          <LightboxProvider texts={ui.common}>
            <a className="skip-link" href="#main" {...L(globalDoc('ui-texts'), 'common.skipToContent')}>
              {ui.common.skipToContent}
            </a>
            <TopBar settings={settings} ui={ui} L={L} />
            <SiteHeader settings={settings} ui={ui} L={L} />
            <main id="main" tabIndex={-1}>
              <ErrorTextsProvider texts={ui.error}>{children}</ErrorTextsProvider>
            </main>
            <ContactBand settings={settings} L={L} />
            <SiteFooter settings={settings} ui={ui} L={L} />
            <MobileBar settings={settings} ui={ui} L={L} />
            <ChatsAndDialogs settings={settings} ui={ui} L={L} />
          </LightboxProvider>
        </UiProvider>
        <JsonLd data={organizationJsonLd(settings)} />
        {/* 后台预览时不加载统计，避免把编辑人员的访问算进去 */}
        <Analytics gtmId={draft ? '' : settings.gtmId} />
        {draft ? <PreviewTools serverURL={siteUrl()} /> : null}
      </body>
    </html>
  )
}
