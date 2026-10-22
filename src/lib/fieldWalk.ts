// 按字段定义遍历一条记录的所有末级字段，得到“字段路径 + 中文名称 + 值”
// 后台“查找内容”和前台定位的字段名提示都用它
import type { Field } from 'payload'

export type LeafField = {
  path: string
  labels: string[]
  description?: string
  type: string
  value: unknown
  hidden: boolean
}

const labelOf = (field: Field): string | undefined => {
  if (!('label' in field)) return undefined
  return typeof field.label === 'string' ? field.label : undefined
}

const descriptionOf = (field: Field): string | undefined => {
  const description = field.admin && 'description' in field.admin ? field.admin.description : undefined
  return typeof description === 'string' ? description : undefined
}

export function walkFields(
  fields: Field[],
  data: unknown,
  visit: (leaf: LeafField) => void,
  prefix = '',
  labels: string[] = [],
  hidden = false,
): void {
  const record = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  for (const field of fields) {
    if (field.type === 'ui') continue
    if (field.type === 'row') {
      walkFields(field.fields, record, visit, prefix, labels, hidden)
      continue
    }
    if (field.type === 'collapsible') {
      const label = typeof field.label === 'string' ? field.label : undefined
      walkFields(field.fields, record, visit, prefix, label ? [...labels, label] : labels, hidden)
      continue
    }
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const label = typeof tab.label === 'string' ? tab.label : undefined
        const nextLabels = label ? [...labels, label] : labels
        if ('name' in tab && tab.name) walkFields(tab.fields, record[tab.name], visit, `${prefix}${tab.name}.`, nextLabels, hidden)
        else walkFields(tab.fields, record, visit, prefix, nextLabels, hidden)
      }
      continue
    }
    if (!('name' in field)) continue
    const path = `${prefix}${field.name}`
    const label = labelOf(field) ?? field.name
    const value = record[field.name]
    if (field.type === 'group') {
      walkFields(field.fields, value, visit, `${path}.`, [...labels, label], hidden)
      continue
    }
    if (field.type === 'array') {
      const rows = Array.isArray(value) ? value : []
      rows.forEach((row, index) => {
        const rowHidden = hidden || (row as { visible?: boolean; enabled?: boolean })?.visible === false || (row as { enabled?: boolean })?.enabled === false
        walkFields(field.fields, row, visit, `${path}.${index}.`, [...labels, `${label} 第 ${index + 1} 项`], rowHidden)
      })
      continue
    }
    if (field.type === 'blocks') continue
    // 旁边勾选了“隐藏”（同级的 名称Hidden 字段）的文字，前台不显示，查找结果里标为已隐藏
    visit({ path, labels: [...labels, label], description: descriptionOf(field), type: field.type, value, hidden: hidden || record[`${field.name}Hidden`] === true })
  }
}

// 富文本转纯文字，用于搜索和摘要
export function lexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: unknown; children?: unknown[]; root?: unknown }
  if (n.root) return lexicalText(n.root)
  const own = typeof n.text === 'string' ? n.text : ''
  const children = Array.isArray(n.children) ? n.children.map(lexicalText).join(' ') : ''
  return `${own} ${children}`.trim()
}

export function leafText(leaf: LeafField): string {
  if (typeof leaf.value === 'string') return leaf.value
  if (typeof leaf.value === 'number') return String(leaf.value)
  if (leaf.type === 'richText') return lexicalText(leaf.value)
  if (leaf.type === 'json' && leaf.value) return JSON.stringify(leaf.value)
  return ''
}

// 按路径取字段中文名称（数组下标会被忽略），找不到时返回 null
export function labelForPath(fields: Field[], path: string): string | null {
  let found: string | null = null
  const push = (labels: string[], label: string) => (labels[labels.length - 1] === label ? labels : [...labels, label])
  const target = path.replace(/\.\d+(?=\.|$)/g, '')
  const scan = (list: Field[], prefix: string, labels: string[]) => {
    for (const field of list) {
      if (found) return
      if (field.type === 'row' || field.type === 'collapsible') {
        const label = field.type === 'collapsible' && typeof field.label === 'string' ? field.label : undefined
        scan(field.fields, prefix, label ? push(labels, label) : labels)
        continue
      }
      if (field.type === 'tabs' || field.type === 'ui' || !('name' in field)) continue
      const p = `${prefix}${field.name}`
      const label = labelOf(field) ?? field.name
      if (field.type === 'group' || field.type === 'array') {
        if (p === target) found = push(labels, label).join(' › ')
        scan(field.fields, `${p}.`, push(labels, label))
        continue
      }
      if (p === target) found = push(labels, label).join(' › ')
    }
  }
  scan(fields, '', [])
  return found
}
