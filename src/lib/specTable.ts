// 参数表数据结构（技术方案 3.4）：型号列有固定 id，数值按型号 id 存，调整或删除型号都不会错位
import { DEFAULT_SPEC_ROWS } from './constants'

export type SpecModel = { id: string; name: string }
export type SpecRow = { id: string; label: string; public: boolean; values: Record<string, string> }
export type SpecTable = { models: SpecModel[]; rows: SpecRow[] }

export const newId = (prefix: string): string => `${prefix}${Math.random().toString(36).slice(2, 9)}`

export function defaultSpecTable(): SpecTable {
  return {
    models: [],
    rows: DEFAULT_SPEC_ROWS.map((label, index) => ({ id: `r${index + 1}`, label, public: false, values: {} })),
  }
}

// 把任意输入整理成合法结构：去掉不存在的型号上的值、补齐缺的字段。
// 编辑器里输入过程中传 trim: false，保留正在输入的空格；保存时再去掉首尾空格和空值
export function normalizeSpecTable(input: unknown, { trim = true }: { trim?: boolean } = {}): SpecTable {
  if (!input || typeof input !== 'object') return defaultSpecTable()
  const clean = (value: unknown) => (typeof value === 'string' ? (trim ? value.trim() : value) : '')
  const raw = input as Partial<SpecTable>
  const models: SpecModel[] = Array.isArray(raw.models)
    ? raw.models
        .filter((m): m is SpecModel => Boolean(m && typeof m === 'object' && typeof m.id === 'string'))
        .map((m) => ({ id: m.id, name: clean(m.name) }))
    : []
  const modelIds = new Set(models.map((m) => m.id))
  const rows: SpecRow[] = Array.isArray(raw.rows)
    ? raw.rows
        .filter((r): r is SpecRow => Boolean(r && typeof r === 'object' && typeof r.id === 'string'))
        .map((r) => {
          const values: Record<string, string> = {}
          if (r.values && typeof r.values === 'object') {
            for (const [key, value] of Object.entries(r.values)) {
              const v = clean(value)
              if (modelIds.has(key) && (trim ? v !== '' : typeof value === 'string')) values[key] = v
            }
          }
          return { id: r.id, label: clean(r.label), public: Boolean(r.public), values }
        })
    : []
  return { models, rows }
}

// 返回第一条错误提示；没有问题时返回 true（作为 Payload 字段校验函数使用）
export function validateSpecTable(input: unknown): true | string {
  const table = normalizeSpecTable(input)
  const ids = new Set<string>()
  for (const [index, model] of table.models.entries()) {
    if (!model.name) return `第 ${index + 1} 个型号没有填写型号名`
    if (ids.has(model.id)) return '型号编号重复，请刷新后重试'
    ids.add(model.id)
  }
  const names = table.models.map((m) => m.name.toLowerCase())
  if (new Set(names).size !== names.length) return '型号名不能重复'
  const rowIds = new Set<string>()
  for (const [index, row] of table.rows.entries()) {
    if (!row.label) return `第 ${index + 1} 行没有填写参数名`
    if (rowIds.has(row.id)) return '参数行编号重复，请刷新后重试'
    rowIds.add(row.id)
  }
  if (table.rows.some((row) => row.public) && table.models.length === 0) return '公开参数前请至少添加一个型号'
  return true
}

// 前台只显示公开且至少有一个值的行（技术方案 3.4）
export function publicRows(table: SpecTable): SpecRow[] {
  return table.rows.filter((row) => row.public && table.models.some((m) => row.values[m.id]))
}
