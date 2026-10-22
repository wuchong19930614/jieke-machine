// 后台“查找内容”页面（技术方案 5.1）：按标题、正文、字段名或前台位置查找，包括已隐藏和已撤下的内容
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps, Field } from 'payload'

import { leafText, walkFields } from '@/lib/fieldWalk'
import { adminUrl, type DocKey } from '@/lib/locate'

type Result = { doc: DocKey; where: string; status?: string; field: string; snippet: string; path: string; hidden: boolean }

const MAX_RESULTS = 200
const SEARCH_COLLECTIONS = ['products', 'cases', 'pages'] as const

function snippet(text: string, q: string): string {
  const index = text.toLowerCase().indexOf(q.toLowerCase())
  if (index < 0) return text.slice(0, 120)
  const start = Math.max(0, index - 40)
  return `${start > 0 ? '…' : ''}${text.slice(start, index + q.length + 60)}${index + q.length + 60 < text.length ? '…' : ''}`
}

function collect(fields: Field[], data: unknown, q: string, base: Omit<Result, 'field' | 'snippet' | 'path' | 'hidden'>, out: Result[]) {
  const needle = q.toLowerCase()
  walkFields(fields, data, (leaf) => {
    if (out.length >= MAX_RESULTS) return
    const text = leafText(leaf)
    const label = leaf.labels.join(' › ')
    const inValue = text.toLowerCase().includes(needle)
    const inLabel = label.toLowerCase().includes(needle) || (leaf.description ?? '').toLowerCase().includes(needle)
    if (!inValue && !inLabel) return
    out.push({
      ...base,
      field: label,
      snippet: inValue ? snippet(text, q) : text ? snippet(text, '') : '（空）',
      path: leaf.path,
      hidden: leaf.hidden,
    })
  })
}

export async function SearchView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  if (!req.user) redirect('/admin/login')
  const payload = req.payload
  const q = (typeof searchParams?.q === 'string' ? searchParams.q : '').trim()
  const results: Result[] = []

  if (q.length >= 2) {
    for (const slug of SEARCH_COLLECTIONS) {
      const config = payload.collections[slug].config
      const label = typeof config.labels?.singular === 'string' ? config.labels.singular : slug
      // draft: true 取每条记录的最新版本，已撤下的内容也能搜到
      const { docs } = await payload.find({ collection: slug, draft: true, depth: 0, limit: 500, pagination: false, overrideAccess: false, req })
      for (const doc of docs) {
        const record = doc as { id: number; name?: string; title?: string; _status?: string }
        collect(config.fields, doc, q, { doc: `${slug}:${record.id}`, where: `${label}「${record.name ?? record.title ?? record.id}」`, status: record._status }, results)
      }
    }
    for (const global of payload.config.globals) {
      const data = await payload.findGlobal({ slug: global.slug, draft: true, depth: 0, overrideAccess: false, req }).catch(() => null)
      if (!data) continue
      collect(global.fields, data, q, { doc: `global:${global.slug}`, where: typeof global.label === 'string' ? global.label : global.slug }, results)
    }
  }

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <h1 className="jk-view__title">查找内容</h1>
        <p className="jk-view__desc">在页面配置、产品、案例和辅助页面中查找文字、字段名或前台位置，包括已隐藏和已撤下的内容。点击结果会打开对应记录并定位到字段。</p>
        <form className="jk-search" method="get">
          <input className="jk-search__input" name="q" defaultValue={q} placeholder="输入至少 2 个字，例如 Capacity、Banner、FAQ" autoFocus />
          <button className="btn btn--style-primary btn--size-medium" type="submit">
            查找
          </button>
        </form>
        {q.length >= 2 ? (
          <p className="jk-view__desc">
            找到 {results.length} 处{results.length >= MAX_RESULTS ? '（只显示前 200 处，请换更具体的关键词）' : ''}
          </p>
        ) : null}
        <ul className="jk-search__results">
          {results.map((result, index) => (
            <li key={`${result.doc}-${result.path}-${index}`} className="jk-search__item">
              <Link href={`${adminUrl(result.doc)}?locate=${encodeURIComponent(result.path)}`}>
                <strong>{result.where}</strong>
                {result.status === 'draft' ? <span className="jk-tag">未发布</span> : null}
                {result.hidden ? <span className="jk-tag">已隐藏</span> : null}
                <span className="jk-search__field">{result.field}</span>
                <span className="jk-search__snippet">{result.snippet}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Gutter>
    </DefaultTemplate>
  )
}
