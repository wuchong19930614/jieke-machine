// 前台定位（技术方案 5.3 第 6 点）的消息协议：后台编辑页与预览页通过 postMessage 互相通知
export const LOCATE_SOURCE = 'jieke-locate'

// 文档标识：集合记录为 “集合:编号”，全局配置为 “global:配置名”
export type DocKey = `${string}:${string}`

export type LocateMessage =
  | { source: typeof LOCATE_SOURCE; action: 'focus-field'; doc: DocKey; path: string }
  | { source: typeof LOCATE_SOURCE; action: 'reveal'; doc: DocKey; path: string }
  | { source: typeof LOCATE_SOURCE; action: 'reveal-result'; found: boolean }

export const collectionDoc = (collection: string, id: number | string): DocKey => `${collection}:${id}`
export const globalDoc = (slug: string): DocKey => `global:${slug}`
// 还没有记录的内容（例如没建过的辅助页面）：点选后打开后台的新建页
export const NEW_DOC_REF = 'create'
export const newDoc = (collection: string): DocKey => `${collection}:${NEW_DOC_REF}`

export function isLocateMessage(data: unknown): data is LocateMessage {
  return Boolean(data && typeof data === 'object' && (data as { source?: unknown }).source === LOCATE_SOURCE)
}

// 后台编辑页地址
export function adminUrl(doc: DocKey): string {
  const [kind, ref] = doc.split(':')
  return kind === 'global' ? `/admin/globals/${ref}` : `/admin/collections/${kind}/${ref}`
}

// 后台字段的 DOM id：Payload 把路径里的点换成两个下划线
export const fieldDomKey = (path: string): string => path.replace(/\./g, '__')
export const pathFromDomKey = (key: string): string => key.replace(/__/g, '.')
