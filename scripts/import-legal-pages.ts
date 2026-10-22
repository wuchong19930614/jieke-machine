// 把 docs/隐私政策与Cookie说明模板（含巴西LGPD）.md 里的英文正文录入后台“辅助页面”（隐私政策、Cookie 说明）
// 能确定的占位符自动填写：公司名、地址取全站设置，域名取 NEXT_PUBLIC_SITE_URL，日期取当天；
// 其余占位符原样保留并列出，由业务方在后台补齐后再发布
// 用法：npm run import:legal（存为草稿）；npm run import:legal -- --publish（直接发布）
// 默认只写本地 file: 数据库，写测试库或正式库要加 --allow-remote
import 'dotenv/config'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const TEMPLATE = path.resolve(process.cwd(), 'docs/隐私政策与Cookie说明模板（含巴西LGPD）.md')

// 模板第二、三章各有一段 ```markdown 代码块，就是要录入的英文正文
const PAGES = [
  { slug: 'privacy-policy', title: 'Privacy Policy', section: '## 二、Privacy Policy' },
  { slug: 'cookie-notice', title: 'Cookie Notice', section: '## 三、Cookie Notice' },
] as const

type EditorConfig = Awaited<ReturnType<typeof editorConfigFactory.default>>
type LexicalNode = Record<string, unknown>

const element = (type: string, children: LexicalNode[], extra: LexicalNode = {}): LexicalNode => ({
  type,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children,
  ...extra,
})

// 官方的 Markdown 转换会把连续几行表格并成一个带换行的段落，表格转换规则匹配不上，
// 所以表格单独拼成表格节点；单元格里的文字仍走官方转换，链接、加粗照样保留
function toTable(lines: string[], editorConfig: EditorConfig): LexicalNode {
  const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())
  const rows = lines.filter((line) => !/^\|(\s*:?-+:?\s*\|)+\s*$/.test(line.trim()))
  return element(
    'table',
    rows.map((line, rowIndex) =>
      element(
        'tablerow',
        cells(line).map((text) => {
          const root = convertMarkdownToLexical({ editorConfig, markdown: text || ' ' }).root as { children: LexicalNode[] }
          // 表头行：headerState 1（与编辑器里“行标题”一致）
          return element('tablecell', root.children, { backgroundColor: null, colSpan: 1, rowSpan: 1, headerState: rowIndex === 0 ? 1 : 0 })
        }),
      ),
    ),
  )
}

function toLexical(markdown: string, editorConfig: EditorConfig) {
  const children: LexicalNode[] = []
  let text: string[] = []
  let table: string[] = []
  const flushText = () => {
    if (text.join('').trim()) children.push(...((convertMarkdownToLexical({ editorConfig, markdown: text.join('\n') }).root as { children: LexicalNode[] }).children))
    text = []
  }
  const flushTable = () => {
    if (table.length) children.push(toTable(table, editorConfig))
    table = []
  }
  for (const line of markdown.split('\n')) {
    if (line.trim().startsWith('|')) {
      flushText()
      table.push(line)
    } else {
      flushTable()
      text.push(line)
    }
  }
  flushTable()
  flushText()
  return { root: element('root', children) }
}

function extractBlock(markdown: string, section: string): string {
  const start = markdown.indexOf(section)
  if (start < 0) throw new Error(`模板里找不到“${section}”一节`)
  const match = markdown.slice(start).match(/```markdown\n([\s\S]*?)\n```/)
  if (!match) throw new Error(`“${section}”一节里没有 markdown 代码块`)
  // 第一行是页面标题，标题单独存在 title 字段，不放进正文
  return match[1].replace(/^# .+\n+/, '')
}

async function main() {
  const uri = process.env.DATABASE_URI || 'file:./dev.db'
  if (!uri.startsWith('file:') && !process.argv.includes('--allow-remote')) {
    console.error(`拒绝写入：DATABASE_URI 不是本地数据库（${uri.split('?')[0]}）。确认要写入时加 --allow-remote。`)
    process.exit(1)
  }
  const publish = process.argv.includes('--publish')
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')
  const fills: Record<string, string | null | undefined> = {
    '[Company legal name]': settings.companyName,
    '[Registered address]': settings.address?.replace(/\s*\n\s*/g, ', '),
    '[www.example.com]': site && !site.startsWith('localhost') ? site : null,
    '[YYYY-MM-DD]': new Date().toISOString().slice(0, 10),
  }
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const template = await readFile(TEMPLATE, 'utf8')

  for (const page of PAGES) {
    let markdown = extractBlock(template, page.section)
    for (const [placeholder, value] of Object.entries(fills)) if (value) markdown = markdown.split(placeholder).join(value)
    // 剩下的方括号占位符（不含 [文字](链接) 这样的链接）
    const left = [...new Set((markdown.match(/\[[^\]\n]+\](?!\()/g) ?? []).filter((p) => p !== '[ID]'))]
    const content = toLexical(markdown, editorConfig)
    const data = { slug: page.slug, title: page.title, content, _status: publish ? 'published' : 'draft' } as never
    const { docs } = await payload.find({ collection: 'pages', where: { slug: { equals: page.slug } }, limit: 1, depth: 0, overrideAccess: true })
    if (docs[0]) await payload.update({ collection: 'pages', id: docs[0].id, data, draft: !publish, overrideAccess: true, context: { disableRevalidate: true } })
    else await payload.create({ collection: 'pages', data, draft: !publish, overrideAccess: true, context: { disableRevalidate: true } })
    console.log(`${page.title}：已${docs[0] ? '更新' : '新建'}，${publish ? '已发布' : '存为草稿'}。`)
    console.log(left.length ? `  还需在后台补齐的占位符：${left.join('、')}` : '  占位符已全部填写。')
  }
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
