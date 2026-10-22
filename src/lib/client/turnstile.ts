// Cloudflare Turnstile 人机验证（技术方案 4.5，后台开启后才用）：访客第一次操作询盘表单时才加载脚本
type TurnstileOptions = {
  sitekey: string
  language?: string
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

export type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let loading: Promise<TurnstileApi> | null = null

export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!loading) {
    loading = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile 加载失败')))
      // 加载失败时移除脚本，下次操作表单再重新加载
      script.onerror = () => {
        script.remove()
        loading = null
        reject(new Error('Turnstile 加载失败'))
      }
      document.head.appendChild(script)
    })
  }
  return loading
}
