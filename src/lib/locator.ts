// 前台定位标注：只在后台预览（草稿模式）时给元素加 data-locate，公开页面不输出字段路径。
// 同一个函数也负责“文字样式”：字段设置了样式时加 data-ts，对应的 CSS 由 textStyleSheet() 输出
import React, { cache } from 'react'

import { defaultsOf, type TextDefs } from '@/content/defineTexts'

import { isDraft } from './data'
import { labelForPath } from './fieldWalk'
import type { DocKey } from './locate'
import { getPayloadClient } from './payload'
import { collectTextStyles, textStyleCss, textStyleId, textStyleSelector } from './textStyle'

export type LocateAttrs = { 'data-locate'?: string; 'data-locate-label'?: string; 'data-ts'?: string }
export type Locator = (doc: DocKey | null | undefined, path: string) => LocateAttrs

// 本次请求里已登记的文字样式：“记录#字段路径” → data-ts 值
const textStyleRegistry = cache(() => new Map<string, string>())

const styleAttrs = (doc: DocKey | null | undefined, path: string): LocateAttrs => {
  const id = doc ? textStyleRegistry().get(`${doc}#${path}`) : undefined
  return id ? { 'data-ts': id } : {}
}

// 页面取到数据后、生成页面内容之前直接调用（不是组件：组件要等返回后才执行，那时 L() 已经调用过了）。
// 登记这条记录里设置过的文字样式，返回输出对应 CSS 的 <style>，放进页面内容里
export function textStyleSheet(doc: DocKey, data: unknown): React.ReactNode {
  const registry = textStyleRegistry()
  const css = Object.entries(collectTextStyles(data))
    .map(([path, style]) => {
      const id = textStyleId(`${doc}#${path}`)
      registry.set(`${doc}#${path}`, id)
      // 按钮的透明度会连底色一起变淡，样式控件里不提供；这里照常输出
      return textStyleCss(textStyleSelector(id), style)
    })
    .join('')
  // 内容都来自清洗后的数字、色号和内置字体名（lib/textStyle.ts），可以直接写入
  return css ? React.createElement('style', { 'data-text-styles': doc, dangerouslySetInnerHTML: { __html: css } }) : null
}

export const getLocator = cache(async (): Promise<Locator> => {
  if (!(await isDraft())) return styleAttrs
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
      ...styleAttrs(doc, path),
      'data-locate': `${doc}#${path}`,
      'data-locate-label': [typeof where === 'string' ? where : kind, label ?? path].join(' › '),
    }
  }
})

// 为一组文案字段生成定位标注，传给客户端组件（只在预览时有内容）
export function locateGroup<T extends TextDefs>(L: Locator, doc: DocKey, group: string, defs: T): Partial<Record<keyof T, LocateAttrs>> {
  const result: Partial<Record<keyof T, LocateAttrs>> = {}
  for (const key of Object.keys(defaultsOf(defs)) as (keyof T)[]) {
    const attrs = L(doc, `${group}.${String(key)}`)
    if (attrs['data-locate'] || attrs['data-ts']) result[key] = attrs
  }
  return result
}
