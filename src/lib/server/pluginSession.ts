// 导入导出插件处理时按用户编号重新查一次当前用户（createExport / createImport），查出来的用户
// 没有“本次会话已通过双重验证”的标记（_strategy），payload-totp 会拒绝：后台下载导出时请求挂住、
// 导入时每条记录都报无权限。这里在插件的接口和钩子外面记下当前会话，插件重新查出同一个用户时
// 把这次会话的标记补回去。只补当前会话本来就有的标记，权限仍按原来的角色和双重验证规则判断
import { AsyncLocalStorage } from 'node:async_hooks'

import type { CollectionAfterReadHook, CollectionConfig, PayloadRequest } from 'payload'

type Session = { id: number | string; strategy: string }

const sessions = new AsyncLocalStorage<Session>()

function sessionOf(req: PayloadRequest | undefined): Session | null {
  const user = req?.user as { id?: number | string; _strategy?: string } | null | undefined
  return user && user.id !== undefined && user._strategy ? { id: user.id, strategy: user._strategy } : null
}

function withSession<T>(req: PayloadRequest | undefined, fn: () => T): T {
  const session = sessionOf(req)
  return session ? sessions.run(session, fn) : fn()
}

// 用户集合的 afterRead：只在插件的接口和钩子里、读到当前会话的同一个用户时补标记
export const restoreSessionStrategy: CollectionAfterReadHook = ({ doc }) => {
  const session = sessions.getStore()
  if (!session || !doc || String(doc.id) !== String(session.id) || doc._strategy) return doc
  return { ...doc, _strategy: session.strategy }
}

type AnyHook = (args: { req?: PayloadRequest }) => unknown

// 用作插件的 overrideExportCollection / overrideImportCollection：接口处理和各个钩子都在记下的会话里执行
export function keepSessionInPlugin({ collection }: { collection: CollectionConfig }): CollectionConfig {
  const hooks = Object.fromEntries(
    Object.entries(collection.hooks ?? {}).map(([name, list]) => [
      name,
      Array.isArray(list) ? (list as AnyHook[]).map((hook) => (args: { req?: PayloadRequest }) => withSession(args.req, () => hook(args))) : list,
    ]),
  ) as CollectionConfig['hooks']
  const endpoints = Array.isArray(collection.endpoints)
    ? collection.endpoints.map((endpoint) => ({ ...endpoint, handler: (req: PayloadRequest) => withSession(req, () => endpoint.handler(req)) }))
    : collection.endpoints
  return { ...collection, hooks, endpoints }
}
