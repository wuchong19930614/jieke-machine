// 单条记录的文案覆盖：不填就用“界面文案”里的默认值，输入框里灰色显示默认值
import type { Field, GroupField } from 'payload'

import { at } from '@/fields'

import type { TextDefs } from './defineTexts'

// location 是本条记录详情页的前台位置，每个字段的说明在它后面接上字段名
export function overrideGroup(name: string, label: string, defs: TextDefs, description: string, location: string): GroupField {
  return {
    name,
    type: 'group',
    label,
    admin: { description },
    fields: Object.entries(defs).map(([key, [fieldLabel, defaultValue]]) => ({
      name: key,
      type: 'text',
      label: fieldLabel,
      admin: { description: at(`${location} › ${fieldLabel}`), placeholder: defaultValue || '（默认不显示）' },
    })) as Field[],
  }
}

// 单条记录“模块文案覆盖”里填了内容的字段，用来盖过界面文案里的默认值
export const overrideTexts = (value: unknown): Record<string, string> =>
  Object.fromEntries(Object.entries((value ?? {}) as Record<string, unknown>).filter(([, v]) => typeof v === 'string' && v.trim() !== '')) as Record<string, string>
