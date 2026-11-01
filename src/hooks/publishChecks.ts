// 发布前检查：前台文字里出现中文时阻止发布（技术方案 5.1）
import { ValidationError } from 'payload'
import type { CollectionBeforeChangeHook, Field, GlobalBeforeChangeHook, PayloadRequest } from 'payload'

// 汉字和全角标点（如“，”“（）”、全角空格）都算中文，英文网站上会显示成中文排版
const CJK = /[㐀-鿿豈-﫿　-〿！-｠]/g

type Problem = { path: string; label: string; chars: string[] }

// 文字里的中文字符，去重后按出现顺序返回
export function chineseChars(text: string): string[] {
  return [...new Set(text.match(CJK) ?? [])]
}

// 提示里列出被拦的字符：最多 3 个，全角空格看不见，写成文字
export function describeChars(chars: string[]): string {
  const shown = chars.slice(0, 3).map((char) => (char === '\u3000' ? '全角空格' : `“${char}”`))
  return `${shown.join('、')}${chars.length > 3 ? ' 等' : ''}`
}

// 富文本：递归收集所有文字节点里的中文字符
function lexicalChars(node: unknown, out: string[] = []): string[] {
  if (!node || typeof node !== 'object') return out
  const n = node as { text?: unknown; children?: unknown[]; root?: unknown }
  if (typeof n.text === 'string') out.push(...chineseChars(n.text))
  if (n.root) lexicalChars(n.root, out)
  if (Array.isArray(n.children)) n.children.forEach((child) => lexicalChars(child, out))
  return [...new Set(out)]
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
    const report = (chars: string[]) => {
      if (chars.length) problems.push({ path, label: labelOf(field), chars })
    }
    switch (field.type) {
      case 'text':
      case 'textarea':
        if (typeof value === 'string') report(chineseChars(value))
        break
      case 'richText':
        report(lexicalChars(value))
        break
      case 'group':
        problems.push(...findChinese(field.fields, value, `${path}.`))
        break
      case 'array':
        if (Array.isArray(value))
          value.forEach((row, index) => problems.push(...findChinese(field.fields, row, `${path}.${index}.`)))
        break
      case 'json':
        report(chineseChars(JSON.stringify(value)))
        break
      default:
        break
    }
  }
  return problems
}

// 传入 req.t 和字段名：右下角的汇总提示按后台语言显示。字段名后面带上被拦的字符，
// 富文本字段下方不一定显示字段说明，只看右下角也能知道要改什么
function toError(problems: Problem[], target: { collection?: string; global?: string }, req: PayloadRequest) {
  return new ValidationError(
    {
      ...target,
      req,
      errors: problems.slice(0, 20).map((p) => {
        const chars = describeChars(p.chars)
        return {
          path: p.path,
          label: `${p.label}（含中文字符 ${chars}）`,
          message: `“${p.label}”含有中文字符 ${chars}，前台只能使用英文。请切换到英文输入法重新输入后再发布。`,
        }
      }),
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
