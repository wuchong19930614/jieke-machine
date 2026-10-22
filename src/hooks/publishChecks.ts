// 发布前检查：前台文字里出现中文时阻止发布（技术方案 5.1）
import { ValidationError } from 'payload'
import type { CollectionBeforeChangeHook, Field, GlobalBeforeChangeHook, PayloadRequest } from 'payload'

const CJK = /[㐀-鿿豈-﫿　-〿！-｠]/

type Problem = { path: string; label: string }

// 富文本：递归找出所有文字节点
function lexicalHasChinese(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as { text?: unknown; children?: unknown[]; root?: unknown }
  if (typeof n.text === 'string' && CJK.test(n.text)) return true
  if (n.root) return lexicalHasChinese(n.root)
  return Array.isArray(n.children) && n.children.some(lexicalHasChinese)
}

function labelOf(field: Field): string {
  const label = 'label' in field ? field.label : undefined
  if (typeof label === 'string') return label
  return 'name' in field ? field.name : ''
}

export function findChinese(fields: Field[], data: unknown, prefix = ''): Problem[] {
  if (!data || typeof data !== 'object') return []
  const record = data as Record<string, unknown>
  const problems: Problem[] = []
  for (const field of fields) {
    // 只在后台显示的字段（例如产品中文名）允许中文
    if (field.custom?.allowChinese) continue
    if (field.type === 'row' || field.type === 'collapsible') {
      problems.push(...findChinese(field.fields, record, prefix))
      continue
    }
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        if ('name' in tab && tab.name) problems.push(...findChinese(tab.fields, record[tab.name], `${prefix}${tab.name}.`))
        else problems.push(...findChinese(tab.fields, record, prefix))
      }
      continue
    }
    if (!('name' in field)) continue
    const value = record[field.name]
    const path = `${prefix}${field.name}`
    if (value === null || value === undefined) continue
    switch (field.type) {
      case 'text':
      case 'textarea':
        if (typeof value === 'string' && CJK.test(value)) problems.push({ path, label: labelOf(field) })
        break
      case 'richText':
        if (lexicalHasChinese(value)) problems.push({ path, label: labelOf(field) })
        break
      case 'group':
        problems.push(...findChinese(field.fields, value, `${path}.`))
        break
      case 'array':
        if (Array.isArray(value))
          value.forEach((row, index) => problems.push(...findChinese(field.fields, row, `${path}.${index}.`)))
        break
      case 'json':
        if (JSON.stringify(value).match(CJK)) problems.push({ path, label: labelOf(field) })
        break
      default:
        break
    }
  }
  return problems
}

// 传入 req.t 和字段名：右下角的汇总提示才会按后台语言显示“下面的字段是无效的：简介”，不显示英文和字段键名
function toError(problems: Problem[], target: { collection?: string; global?: string }, req: PayloadRequest) {
  return new ValidationError(
    {
      ...target,
      req,
      errors: problems.slice(0, 20).map((p) => ({
        path: p.path,
        label: p.label,
        message: `“${p.label}”含有中文，前台只能使用英文。请修改后再发布。`,
      })),
    },
    req.t,
  )
}

export const rejectChineseOnPublish: CollectionBeforeChangeHook = ({ data, collection, req }) => {
  if (data?._status !== 'published') return data
  const problems = findChinese(collection.fields, data)
  if (problems.length) throw toError(problems, { collection: collection.slug }, req)
  return data
}

export const rejectChineseOnPublishGlobal: GlobalBeforeChangeHook = ({ data, global, req }) => {
  if (data?._status !== 'published') return data
  const problems = findChinese(global.fields, data)
  if (problems.length) throw toError(problems, { global: global.slug }, req)
  return data
}
