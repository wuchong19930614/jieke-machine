// 前台定位标注：只在后台预览（草稿模式）时给元素加 data-locate，公开页面不输出字段路径
import { cache } from 'react'

import { isDraft } from './data'
import { labelForPath } from './fieldWalk'
import type { DocKey } from './locate'
import { getPayloadClient } from './payload'

export type LocateAttrs = { 'data-locate'?: string; 'data-locate-label'?: string }
export type Locator = (doc: DocKey | null | undefined, path: string) => LocateAttrs

const noop: Locator = () => ({})

export const getLocator = cache(async (): Promise<Locator> => {
  if (!(await isDraft())) return noop
  const payload = await getPayloadClient()
  return (doc, path) => {
    if (!doc) return {}
    const [kind, ref] = doc.split(':')
    const fields =
      kind === 'global'
        ? payload.config.globals.find((g) => g.slug === ref)?.fields
        : payload.collections[kind as keyof typeof payload.collections]?.config.fields
    const label = fields ? labelForPath(fields, path) : null
    const where =
      kind === 'global'
        ? payload.config.globals.find((g) => g.slug === ref)?.label
        : payload.collections[kind as keyof typeof payload.collections]?.config.labels?.singular
    return {
      'data-locate': `${doc}#${path}`,
      'data-locate-label': [typeof where === 'string' ? where : kind, label ?? path].join(' › '),
    }
  }
})
