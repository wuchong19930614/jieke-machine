// tawk.to 加载（技术方案 4.5、7.2）：页面打开时不加载；访客第一次点击客服入口时才加载脚本，
// autoStart = false 并始终隐藏自带入口，由红蓝两个入口调用 start()、maximize() 打开对话
import { track } from './analytics'

type TawkStatus = 'online' | 'away' | 'offline'
export type ChatEntry = 'red' | 'blue'

type TawkApi = {
  autoStart?: boolean
  onLoad?: () => void
  onStatusChange?: (status: TawkStatus) => void
  onChatMinimized?: () => void
  onChatStarted?: () => void
  start?: (options?: { showWidget?: boolean }) => void
  getStatus?: () => TawkStatus
  maximize?: () => void
  hideWidget?: () => void
  showWidget?: () => void
}

declare global {
  interface Window {
    Tawk_API?: TawkApi
    Tawk_LoadStart?: Date
  }
}

type Waiter = { resolve: (api: TawkApi) => void; reject: (error: Error) => void }

const waiters = new Set<Waiter>()
let loadedApi: TawkApi | null = null
let script: HTMLScriptElement | null = null
// 最近一次从哪个入口打开对话，用于 start_chat 统计
let lastEntry: ChatEntry = 'red'

export function loadTawk(propertyId: string, widgetId: string, timeoutMs = 12000): Promise<TawkApi> {
  if (!propertyId || !widgetId) return Promise.reject(new Error('tawk.to 未配置'))
  if (loadedApi) return Promise.resolve(loadedApi)
  return new Promise<TawkApi>((resolve, reject) => {
    let timer = 0
    const waiter: Waiter = {
      resolve: (api) => {
        window.clearTimeout(timer)
        resolve(api)
      },
      reject: (error) => {
        window.clearTimeout(timer)
        reject(error)
      },
    }
    timer = window.setTimeout(() => {
      waiters.delete(waiter)
      reject(new Error('tawk.to 连接超时'))
    }, timeoutMs)
    waiters.add(waiter)
    // 脚本已插入（例如上次等待超时后它还在加载）时接着等它连上，不重复插入：重复加载 tawk 脚本会连不上
    if (script) return

    const api: TawkApi = (window.Tawk_API = window.Tawk_API || {})
    window.Tawk_LoadStart = new Date()
    api.autoStart = false
    api.onLoad = () => {
      api.hideWidget?.()
      loadedApi = api
      waiters.forEach((w) => w.resolve(api))
      waiters.clear()
    }
    // 对话窗口收起时再次隐藏自带入口
    api.onChatMinimized = () => api.hideWidget?.()
    // 对话开始的统计只在这里推送一次（弹出式聊天窗口中不触发，可能少计，见技术方案 7.3）
    api.onChatStarted = () => track('start_chat', { entry: lastEntry })
    script = document.createElement('script')
    script.async = true
    script.src = `https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    // 脚本加载后才连接客服；连接完成会触发 onLoad
    script.onload = () => window.Tawk_API?.start?.({ showWidget: false })
    // 脚本没加载成功时移除，下次打开客服重新加载
    script.onerror = () => {
      script?.remove()
      script = null
      waiters.forEach((w) => w.reject(new Error('tawk.to 脚本加载失败')))
      waiters.clear()
    }
    document.body.appendChild(script)
  })
}

// 打开对话窗口
export function openTawkChat(api: TawkApi, entry: ChatEntry): void {
  lastEntry = entry
  api.showWidget?.()
  api.maximize?.()
}

export type { TawkApi, TawkStatus }
