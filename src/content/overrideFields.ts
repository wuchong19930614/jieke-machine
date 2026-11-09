// 单条记录的文案覆盖：不填就用“界面文案”里的默认值，输入框里灰色显示默认值
import type { Field, GroupField } from 'payload'

import { at, textStyleField } from '@/fields'
import { isButtonTextKey } from '@/lib/textStyle'

import type { TextDefs } from './defineTexts'

// location 是本条记录详情页的前台位置，每个字段的说明在它后面接上字段名
// styledKeys：这些标题、按钮旁边另加“文字样式”（第 4、15 点），存在 键名Style
export function overrideGroup(name: string, label: string, defs: TextDefs, description: string, location: string, styledKeys: readonly string[] = []): GroupField {
  return {
    name,
    type: 'group',
    label,
    admin: { description },
    fields: Object.entries(defs).flatMap(([key, [fieldLabel, defaultValue]]) => {
      const field = {
        name: key,
        type: 'text',
        label: fieldLabel,
        admin: { description: at(`${location} › ${fieldLabel}`), placeholder: defaultValue || '（默认不显示）' },
      } as Field
      return styledKeys.includes(key) ? [field, textStyleField(key, fieldLabel, { opacity: !isButtonTextKey(key) })] : [field]
    }),
  }
}

// 单条记录“模块文案覆盖”里填了内容的字段，用来盖过界面文案里的默认值
export const overrideTexts = (value: unknown): Record<string, string> =>
  Object.fromEntries(Object.entries((value ?? {}) as Record<string, unknown>).filter(([, v]) => typeof v === 'string' && v.trim() !== '')) as Record<string, string>
