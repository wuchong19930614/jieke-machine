// 访问来源：首次进入网站时记录落地页、来源网站和广告参数，提交询盘时一并带上（技术方案 3.7、6.1）
const KEY = 'jk_attribution'

export type Attribution = {
  landingPage: string
  referrer: string
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string }
}

export function captureAttribution(): void {
  try {
    if (sessionStorage.getItem(KEY)) return
    const url = new URL(window.location.href)
    const utm: NonNullable<Attribution['utm']> = {}
    for (const key of ['source', 'medium', 'campaign', 'term', 'content'] as const) {
      const value = url.searchParams.get(`utm_${key}`)
      if (value) utm[key] = value.slice(0, 200)
    }
    const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : ''
    const data: Attribution = { landingPage: url.href.slice(0, 500), referrer: referrer.slice(0, 500) }
    if (Object.keys(utm).length) data.utm = utm
    sessionStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // 隐私模式下 sessionStorage 可能不可用，不影响提交询盘
  }
}

export function readAttribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Attribution
  } catch {
    // 忽略
  }
  return { landingPage: typeof window !== 'undefined' ? window.location.href : '', referrer: '' }
}
