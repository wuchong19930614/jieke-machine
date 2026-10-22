// 产品或案例修改网址短名时自动新增永久跳转（308），并把旧规则改为直接指向新网址（技术方案 3.9）
import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, PayloadRequest } from 'payload'

export const normalizePath = (path: string): string => {
  const clean = `/${path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '')}`
  return clean === '/' ? '/' : `${clean}/`
}

export async function upsertRedirect(req: PayloadRequest, fromPath: string, toPath: string): Promise<void> {
  const { payload } = req
  const from = normalizePath(fromPath)
  const to = normalizePath(toPath)
  if (from === to) return

  // 新网址如果曾经是某条规则的来源，删掉那条规则，避免新网址被跳走或形成循环
  await payload.delete({ collection: 'redirects', where: { from: { equals: to } }, req, overrideAccess: true })

  // 原来指向旧网址的规则，改为直接指向新网址，避免多次跳转
  const chained = await payload.find({
    collection: 'redirects',
    where: { 'to.url': { equals: from } },
    limit: 200,
    pagination: false,
    req,
    overrideAccess: true,
  })
  for (const doc of chained.docs) {
    await payload.update({
      collection: 'redirects',
      id: doc.id,
      data: { to: { type: 'custom', url: to } },
      req,
      overrideAccess: true,
    })
  }

  const existing = await payload.find({
    collection: 'redirects',
    where: { from: { equals: from } },
    limit: 1,
    req,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    await payload.update({
      collection: 'redirects',
      id: existing.docs[0].id,
      data: { to: { type: 'custom', url: to }, type: '308' },
      req,
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'redirects',
      data: { from, to: { type: 'custom', url: to }, type: '308' },
      req,
      overrideAccess: true,
    })
  }
}

const publishedSlugKey = (collection: string, id: number | string) => `publishedSlug:${collection}:${id}`

// 发布前记下线上版本的网址短名。开启草稿后 previousDoc 是最近一次保存的版本：
// 先“保存草稿”改了短名再“发布”时，previousDoc 里已经是新短名，比较不出变化。
// 保存草稿不改主表，主表里一直是线上版本，所以直接用数据库适配器读主表。
// 不能用 payload.findByID：本地接口会把 req.context 换成一份拷贝，这里写进去的值到 afterChange 就丢了
export const rememberPublishedSlug: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req, collection }) => {
  if (operation !== 'update' || data?._status !== 'published' || !originalDoc?.id) return data
  const live = (await req.payload.db.findOne({
    collection: collection.slug,
    where: { id: { equals: originalDoc.id } },
    req,
  })) as { slug?: string | null; _status?: string | null } | null
  // 只有已发布过的旧网址才可能被收录或分享；撤下状态的记录线上已经没有页面
  req.context[publishedSlugKey(collection.slug, originalDoc.id)] = live?._status === 'published' ? live.slug : null
  return data
}

export function slugRedirectHook(basePath: '/products' | '/case-studies'): CollectionAfterChangeHook {
  return async ({ doc, req, operation, collection, context }) => {
    // 保存草稿不影响线上网址，发布时才建跳转
    if (operation !== 'update' || doc?._status !== 'published') return doc
    const oldSlug = context[publishedSlugKey(collection.slug, doc.id)] as string | null | undefined
    const newSlug = doc?.slug as string | undefined
    if (!oldSlug || !newSlug || oldSlug === newSlug) return doc
    await upsertRedirect(req, `${basePath}/${oldSlug}/`, `${basePath}/${newSlug}/`)
    return doc
  }
}
