// 后台“操作教程”页面（技术方案 5.1）：直接读取 docs/后台操作教程.md 并转成富文本显示，文档和后台始终是同一份
import fs from 'node:fs/promises'
import path from 'node:path'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { SerializedHeadingNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { type JSXConvertersFunction, LinkJSXConverter, RichText } from '@payloadcms/richtext-lexical/react'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import type { ReactNode } from 'react'

import { lexicalText } from '@/lib/fieldWalk'

// 部署时由 next.config.ts 的 outputFileTracingIncludes 把这个文件带进后台页面的函数包
const GUIDE_FILE = path.join(process.cwd(), 'docs', '后台操作教程.md')

// 文档用 <a id="s1"></a> 给下一个标题设锚点（与 README 写法一致），目录链接指向这些锚点。
// 富文本不支持 HTML，先把这些行拿掉，记下“标题文字 → 锚点”，渲染标题时再加回 id
function splitAnchors(markdown: string): { markdown: string; anchors: Map<string, string> } {
  const anchors = new Map<string, string>()
  const lines: string[] = []
  let pending: string | null = null
  for (const line of markdown.split('\n')) {
    const anchor = /^<a id="([^"]+)"><\/a>$/.exec(line.trim())
    if (anchor) {
      pending = anchor[1]
      continue
    }
    const heading = /^#{1,6}\s+(.+)$/.exec(line)
    if (heading && pending) {
      anchors.set(heading[1].replace(/[*`]/g, '').trim(), pending)
      pending = null
    }
    lines.push(line)
  }
  return { markdown: lines.join('\n'), anchors }
}

const converters =
  (anchors: Map<string, string>): JSXConvertersFunction =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    // 教程里只有站内锚点和后台地址这类自定义链接，没有指向产品、案例的内部链接
    ...LinkJSXConverter({ internalDocToHref: () => '#' }),
    heading: ({ node, nodesToJSX }) => {
      const Tag = (node as SerializedHeadingNode).tag
      return <Tag id={anchors.get(lexicalText(node))}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
  })

export async function GuideView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  if (!req.user) redirect('/admin/login')
  const source = await fs.readFile(GUIDE_FILE, 'utf8').catch(() => null)
  let content: ReactNode = <p className="jk-view__desc">没有找到教程文件 docs/后台操作教程.md，请联系开发人员。</p>
  if (source) {
    const { markdown, anchors } = splitAnchors(source)
    const editorConfig = await editorConfigFactory.default({ config: req.payload.config })
    const data = convertMarkdownToLexical({ editorConfig, markdown }) as unknown as SerializedEditorState
    content = <RichText data={data} converters={converters(anchors)} disableContainer />
  }
  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <div className="jk-guide">{content}</div>
      </Gutter>
    </DefaultTemplate>
  )
}
