// 统计事件：只往 GTM 数据层推送，不含姓名、邮箱、电话和需求内容（技术方案 7.3）
type DataLayerEvent = { event: string } & Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

export function track(event: string, params: Record<string, string | number | boolean | undefined> = {}): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  const payload: DataLayerEvent = { event, ...params }
  window.dataLayer.push(payload)
}
