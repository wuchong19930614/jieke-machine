// 文案字段的统一定义：同一份定义既生成后台字段，也提供前台默认值，避免两处写法不一致
import type { Field, GroupField } from 'payload'

import { at, hideField, textStyleField } from '@/fields'
import { isButtonTextKey } from '@/lib/textStyle'

// hideable：标题、按钮这类带默认文案的字段，旁边加“隐藏”勾选（技术方案 5.2）
export type TextDef = readonly [label: string, defaultValue: string, options?: { textarea?: boolean; hint?: string; hideable?: boolean }]
export type TextDefs = Record<string, TextDef>
export type TextsOf<T extends TextDefs> = { [K in keyof T]: string }

export function defaultsOf<T extends TextDefs>(defs: T): TextsOf<T> {
  const result = {} as Record<string, string>
  for (const [key, [, value]] of Object.entries(defs)) result[key] = value
  return result as TextsOf<T>
}

export function textFields(defs: TextDefs, location: string, { styled = false }: { styled?: boolean } = {}): Field[] {
  return Object.entries(defs).flatMap(([name, [label, defaultValue, options]]) => {
    const field = {
      name,
      type: options?.textarea ? 'textarea' : 'text',
      label,
      // 后台预填默认文案。用函数形式，Payload 就不会把它写进表结构的列默认值：
      // 迁移文件会给每行 SQL 加缩进，多行默认值（如自动回复正文）的换行后会多出空格
      defaultValue: defaultValue ? () => defaultValue : undefined,
      admin: {
        description: at(`${location} › ${label}`, options?.hint),
        placeholder: defaultValue || undefined,
        ...(options?.hideable ? { width: '75%' } : {}),
      },
    } as Field
    // 可隐藏的字段与“隐藏”勾选放在同一行；行不占数据路径，字段仍是 name 和 nameHidden
    const main = options?.hideable ? ({ type: 'row', fields: [field, hideField(name, label)] } as Field) : field
    return styled ? [main, textStyleField(name, label, { opacity: !isButtonTextKey(name) })] : [main]
  })
}

export function textGroup(name: string, label: string, location: string, defs: TextDefs, options?: { styled?: boolean }): GroupField {
  return {
    name,
    type: 'group',
    label,
    admin: { description: `前台位置：${location}。留空时使用默认文案（输入框里的灰色提示）。` },
    fields: textFields(defs, location, options),
  }
}

// 后台留空的字段回退到默认文案；后台填了内容就用后台的；勾选“隐藏”的返回空串，前台不输出
export function withDefaults<T extends TextDefs>(defs: T, value: unknown): TextsOf<T> {
  const defaults = defaultsOf(defs)
  if (!value || typeof value !== 'object') return defaults
  const record = value as Record<string, unknown>
  const result = { ...defaults } as Record<string, string>
  for (const [key, [, , options]] of Object.entries(defs)) {
    const v = record[key]
    if (options?.hideable && record[`${key}Hidden`] === true) result[key] = ''
    else if (typeof v === 'string' && v.trim() !== '') result[key] = v
  }
  return result as TextsOf<T>
}

// 文案里的 {变量} 替换；任一变量为空时返回空串，由调用处整行隐藏（英文界面文案 1.3 第 6 条）
export function fill(template: string, vars: Record<string, string | number | null | undefined>): string {
  let empty = false
  const out = template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key]
    if (v === null || v === undefined || v === '') {
      empty = true
      return ''
    }
    return String(v)
  })
  return empty ? '' : out
}
