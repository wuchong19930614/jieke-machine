// Cookie 设置（技术方案 7.3）：分析类 Cookie 默认开启，访客可在页脚 Cookie Settings 关闭；
// 选择记在一个必要 Cookie 里，关闭后不再加载 GTM，同时通过 Consent Mode 把统计设为拒绝
export const CONSENT_COOKIE = 'jk_cookie_settings'
export const CONSENT_EVENT = 'jk:consent-change'

export function analyticsAllowed(): boolean {
  if (typeof document === 'undefined') return true
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) !== 'analytics=denied' : true
}

export function setAnalyticsAllowed(allowed: boolean): void {
  const value = encodeURIComponent(allowed ? 'analytics=granted' : 'analytics=denied')
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { analytics: allowed } }))
}
