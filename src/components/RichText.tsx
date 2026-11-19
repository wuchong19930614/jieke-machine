// 富文本：按结构化数据渲染，不支持直接写 HTML（技术方案 9.1）
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { type JSXConvertersFunction, LinkJSXConverter, RichText as LexicalRichText, TextJSXConverter } from '@payloadcms/richtext-lexical/react'

import { lexicalText } from '@/lib/fieldWalk'
import type { LocateAttrs } from '@/lib/locator'
import { frontendPath } from '@/lib/previewPath'
import { richTextStyles } from '@/lib/richTextStyles'

// 内部链接（指向产品、案例、辅助页面）换成前台网址；不传时 Payload 会输出 href="#"
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  text: (args) => {
    const state = (args.node as unknown as { $?: Record<string, unknown> }).$
    const preset = (key: keyof typeof richTextStyles) => {
      const value = state?.[key]
      const options = richTextStyles[key] as Record<string, { css: Record<string, string> }>
      return typeof value === 'string' && Object.hasOwn(options, value) ? options[value].css : undefined
    }
    const color = preset('color')?.color
    const fontSize = preset('fontSize')?.['font-size']
    const fontFamily = preset('fontFamily')?.['font-family']
    const convert = TextJSXConverter.text
    const content = typeof convert === 'function' ? convert(args) : args.node.text
    return color || fontSize || fontFamily ? <span style={{ color, fontSize, fontFamily }}>{content}</span> : content
  },
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc
      const value = doc?.value as { slug?: string | null } | string | number | undefined
      const slug = value && typeof value === 'object' ? value.slug : null
      return (doc && slug ? frontendPath({ collection: doc.relationTo, slug }) : null) ?? '#'
    },
  }),
})

export function hasRichText(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root?.children?.length) return false
  if (lexicalText(value).trim()) return true
  // 只有图片等非文字节点时也算有内容
  return JSON.stringify(root.children).includes('"type":"upload"')
}

export function RichText({ data, className, attrs }: { data: unknown; className?: string; attrs?: LocateAttrs }) {
  if (!hasRichText(data)) return null
  return (
    <div className={`lp-rich ${className ?? ''}`} {...attrs}>
      <LexicalRichText data={data as SerializedEditorState} converters={converters} disableContainer />
    </div>
  )
}
