'use client'
// 统计（技术方案 7.3、8.2）：页面可交互后加载 GTM；访客关闭统计后不加载，并把 Consent Mode 设为拒绝。
// 邮箱、电话、WhatsApp 点击和手册下载通过 data-track 属性统一上报；同时记录访问来源和网页性能指标
import { useEffect } from 'react'
import { onCLS, onINP, onLCP } from 'web-vitals'

import { track } from '@/lib/client/analytics'
import { captureAttribution } from '@/lib/client/attribution'
import { analyticsAllowed, CONSENT_EVENT } from '@/lib/client/consent'

// gtag 命令必须以 arguments 对象推入：GTM 只把 arguments 识别为命令，推入普通数组时同意设置（consent）不会生效
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer || []
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments)
}

let gtmLoaded = false

function loadGtm(id: string) {
  if (gtmLoaded || !id) return
  gtmLoaded = true
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)
}

export function Analytics({ gtmId }: { gtmId: string }) {
  useEffect(() => {
    captureAttribution()
    const allowed = analyticsAllowed()
    // 广告相关存储始终为拒绝（首期不做再营销）；统计按访客选择
    gtag('consent', 'default', {
      analytics_storage: allowed ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    if (allowed && gtmId) {
      const start = () => loadGtm(gtmId)
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback
      if (idle) idle.call(window, start, { timeout: 3000 })
      else window.setTimeout(start, 1500)
    }

    const onConsent = (e: Event) => {
      const granted = Boolean((e as CustomEvent<{ analytics: boolean }>).detail?.analytics)
      gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' })
      if (granted && gtmId) loadGtm(gtmId)
    }
    window.addEventListener(CONSENT_EVENT, onConsent)

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]')
      if (!el) return
      const params: Record<string, string> = {}
      if (el.dataset.trackLocation) params.location = el.dataset.trackLocation
      if (el.dataset.trackProduct) params.product_name = el.dataset.trackProduct
      track(el.dataset.track as string, params)
    }
    document.addEventListener('click', onClick)

    // 真实访客的 LCP、CLS、INP 上报到 GA4（技术方案 8.2 第 8 条）
    const report = (metric: { name: string; value: number; rating: string; id: string }) =>
      track('web_vitals', { metric_name: metric.name, metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value), metric_rating: metric.rating, metric_id: metric.id })
    onLCP(report)
    onCLS(report)
    onINP(report)

    return () => {
      window.removeEventListener(CONSENT_EVENT, onConsent)
      document.removeEventListener('click', onClick)
    }
  }, [gtmId])

  return null
}
