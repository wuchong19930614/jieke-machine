// 产品或案例修改网址短名时自动新增 301 跳转，并把旧规则改为直接指向新网址（技术方案 3.9）
import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

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
      data: { to: { type: 'custom', url: to }, type: '301' },
      req,
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'redirects',
      data: { from, to: { type: 'custom', url: to }, type: '301' },
      req,
      overrideAccess: true,
    })
  }
}

export function slugRedirectHook(basePath: '/products' | '/case-studies'): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req, operation }) => {
    // 保存草稿不影响线上网址，发布时才建跳转
    if (operation !== 'update' || doc?._status !== 'published') return doc
    const oldSlug = previousDoc?.slug as string | undefined
    const newSlug = doc?.slug as string | undefined
    // 只有已发布过的旧网址才可能被收录或分享，草稿改名不建跳转
    if (!oldSlug || !newSlug || oldSlug === newSlug || previousDoc?._status !== 'published') return doc
    await upsertRedirect(req, `${basePath}/${oldSlug}/`, `${basePath}/${newSlug}/`)
    return doc
  }
}
