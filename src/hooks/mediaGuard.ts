// 删除媒体前检查是否仍被引用，有引用时阻止删除并列出位置（技术方案 5.4）
import { APIError } from 'payload'
import type { CollectionBeforeDeleteHook, Field, Payload } from 'payload'

type Ref = { where: string; path: string }

const idOf = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return 'id' in value ? String((value as { id: unknown }).id) : null
  return String(value)
}

function lexicalUploads(node: unknown, mediaId: string): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as { type?: string; value?: unknown; relationTo?: string; children?: unknown[]; root?: unknown }
  if (n.type === 'upload' && n.relationTo === 'media' && idOf(n.value) === mediaId) return true
  if (n.root) return lexicalUploads(n.root, mediaId)
  return Array.isArray(n.children) && n.children.some((child) => lexicalUploads(child, mediaId))
}

export function findUploadRefs(fields: Field[], data: unknown, mediaId: string, prefix = ''): string[] {
  if (!data || typeof data !== 'object') return []
  const record = data as Record<string, unknown>
  const found: string[] = []
  for (const field of fields) {
    if (field.type === 'row' || field.type === 'collapsible') {
      found.push(...findUploadRefs(field.fields, record, mediaId, prefix))
      continue
    }
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        if ('name' in tab && tab.name) found.push(...findUploadRefs(tab.fields, record[tab.name], mediaId, `${prefix}${tab.name}.`))
        else found.push(...findUploadRefs(tab.fields, record, mediaId, prefix))
      }
      continue
    }
    if (!('name' in field)) continue
    const value = record[field.name]
    const path = `${prefix}${field.name}`
    if (value === null || value === undefined) continue
    if (field.type === 'upload') {
      const values = Array.isArray(value) ? value : [value]
      if (values.some((v) => idOf(v) === mediaId)) found.push(path)
    } else if (field.type === 'richText') {
      if (lexicalUploads(value, mediaId)) found.push(path)
    } else if (field.type === 'group') {
      found.push(...findUploadRefs(field.fields, value, mediaId, `${path}.`))
    } else if (field.type === 'array' && Array.isArray(value)) {
      value.forEach((row, index) => found.push(...findUploadRefs(field.fields, row, mediaId, `${path}.${index + 1}.`)))
    } else if (field.type === 'blocks' && Array.isArray(value)) {
      value.forEach((row, index) => {
        const block = field.blocks.find((b) => b.slug === (row as { blockType?: string }).blockType)
        if (block) found.push(...findUploadRefs(block.fields, row, mediaId, `${path}.${index + 1}.`))
      })
    }
  }
  return found
}

const CONTENT_COLLECTIONS = ['products', 'cases', 'pages'] as const

// 最新草稿和线上已发布版本都要查：草稿里换掉了某张图、但还没发布时，线上页面仍在用它
const VERSIONS = [true, false] as const

export async function findMediaReferences(payload: Payload, mediaId: string): Promise<Ref[]> {
  const refs: Ref[] = []
  const add = (where: string, paths: string[]) => {
    for (const path of paths) if (!refs.some((r) => r.where === where && r.path === path)) refs.push({ where, path })
  }
  for (const slug of CONTENT_COLLECTIONS) {
    const config = payload.collections[slug]?.config
    if (!config) continue
    for (const draft of VERSIONS) {
      const result = await payload.find({ collection: slug, depth: 0, draft, limit: 1000, pagination: false })
      for (const doc of result.docs) {
        const title = String((doc as { name?: string; title?: string }).name ?? (doc as { title?: string }).title ?? doc.id)
        add(`${config.labels?.singular ?? slug}「${title}」`, findUploadRefs(config.fields, doc, mediaId))
      }
    }
  }
  for (const global of payload.config.globals) {
    const label = typeof global.label === 'string' ? global.label : global.slug
    for (const draft of VERSIONS) {
      const doc = await payload.findGlobal({ slug: global.slug, depth: 0, draft })
      add(label, findUploadRefs(global.fields, doc, mediaId))
    }
  }
  return refs
}

export const blockReferencedMediaDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const refs = await findMediaReferences(req.payload, String(id))
  if (!refs.length) return
  const list = refs
    .slice(0, 10)
    .map((ref) => `${ref.where} › ${ref.path}`)
    .join('；')
  throw new APIError(`该文件仍被以下位置引用，请先替换或移除后再删除：${list}${refs.length > 10 ? ' 等' : ''}`, 400, null, true)
}
