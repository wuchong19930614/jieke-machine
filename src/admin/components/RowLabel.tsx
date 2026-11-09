'use client'
// 列表行标题：模块顺序显示模块名，其他列表显示条目标题，隐藏的条目加“已隐藏”
import { useRowLabel } from '@payloadcms/ui'

import { ABOUT_SECTIONS, HOME_SECTIONS, IMAGE_SECTION_MODULES, PRODUCT_SECTIONS, SECTION_DEVICES } from '@/lib/constants'

const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  [...HOME_SECTIONS, ...ABOUT_SECTIONS, ...PRODUCT_SECTIONS, ...IMAGE_SECTION_MODULES].map((s) => [s.value, s.label]),
)

export function SectionRowLabel() {
  const { data, rowNumber } = useRowLabel<{ module?: string; visible?: boolean; device?: string }>()
  const label = (data?.module && SECTION_LABELS[data.module]) || `模块 ${(rowNumber ?? 0) + 1}`
  const device = data?.device && data.device !== 'all' ? SECTION_DEVICES.find((d) => d.value === data.device)?.label : null
  return (
    <span>
      {label}
      {device ? `（${device}）` : ''}
      {data?.visible === false ? '（已隐藏）' : ''}
    </span>
  )
}

export function TitleRowLabel({ field = 'title' }: { field?: string }) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const value = data?.[field]
  const hidden = data?.visible === false || data?.enabled === false
  return (
    <span>
      {typeof value === 'string' && value.trim() ? value : `第 ${(rowNumber ?? 0) + 1} 项`}
      {hidden ? '（已隐藏）' : ''}
    </span>
  )
}
