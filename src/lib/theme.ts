// 主题档位 → CSS 变量（技术方案 3.2、5.2）
import type { CSSProperties } from 'react'

import { FONTS, PALETTES, QUOTE_COLORS } from '@/globals/Theme'
import type { Theme } from '@/payload-types'

const FONT_SCALE = { small: 0.93, standard: 1, large: 1.08 } as const
const SPACE_SCALE = { compact: 0.8, standard: 1, relaxed: 1.25 } as const
const SYSTEM = "Arial, 'Helvetica Neue', Helvetica, sans-serif"

export function themeStyle(theme: Theme | null | undefined, fontVars: Record<string, string>): CSSProperties {
  const palette = PALETTES[(theme?.palette ?? 'industrial-blue') as keyof typeof PALETTES] ?? PALETTES['industrial-blue']
  const accent = QUOTE_COLORS[(theme?.quoteButtonColor ?? 'orange') as keyof typeof QUOTE_COLORS]?.value ?? QUOTE_COLORS.orange.value
  const font = (key: string | null | undefined) => (key && key !== 'system' && key in FONTS && fontVars[key] ? `var(${fontVars[key]}), ${SYSTEM}` : SYSTEM)
  return {
    '--lp-dark': palette.dark,
    '--lp-ink': palette.ink,
    '--lp-muted': palette.muted,
    '--lp-soft': palette.soft,
    '--lp-line': palette.line,
    '--lp-brand': palette.brand,
    '--lp-brand-ink': palette.brandInk,
    '--lp-accent': accent,
    '--font-heading': font(theme?.headingFont),
    '--font-body': font(theme?.bodyFont),
    '--font-scale': String(FONT_SCALE[(theme?.fontScale ?? 'standard') as keyof typeof FONT_SCALE] ?? 1),
    '--space-scale': String(SPACE_SCALE[(theme?.spacingScale ?? 'standard') as keyof typeof SPACE_SCALE] ?? 1),
  } as CSSProperties
}

// 按用途的默认图框比例（主题设置 › 默认图框比例）
export function defaultRatio(theme: Theme | null | undefined, usage: keyof NonNullable<Theme['defaultRatios']>): string {
  const ratios = theme?.defaultRatios
  const value = ratios?.[usage]
  if (value) return value
  return { equipment: '4/3', factory: '4/3', case: '4/3', application: '1/1', videoCover: '16/9', banner: 'original' }[usage] ?? '4/3'
}
