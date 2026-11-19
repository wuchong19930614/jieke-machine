// 主题档位 → CSS 变量（技术方案 3.2、5.2）
import type { CSSProperties } from 'react'

import { FONTS, PALETTES, QUOTE_COLORS } from '@/globals/Theme'
import type { Theme } from '@/payload-types'

import { cleanTextStyle, textStyleCss } from './textStyle'

const FONT_SCALE = { small: 0.93, standard: 1, large: 1.08 } as const
const SPACE_SCALE = { compact: 0.8, standard: 1, relaxed: 1.25 } as const
const SYSTEM = "Arial, 'Helvetica Neue', Helvetica, sans-serif"
// 页面宽度（主题设置 › 页面宽度）
const CONTENT_WIDTHS = ['1180', '1280', '1440'] as const
const SIDE_MIN = { standard: '5%', wide: 'max(5%, 48px)', wider: 'max(5%, 80px)' } as const

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
    '--lp-content-width': `${CONTENT_WIDTHS.find((w) => w === theme?.contentWidth) ?? '1180'}px`,
    '--lp-side-min': SIDE_MIN[(theme?.sideGutter ?? 'standard') as keyof typeof SIDE_MIN] ?? SIDE_MIN.standard,
    // 首页横幅：默认与内容同宽（左右各留 --gutter、上方留白、圆角），选“铺满”时三项都归零
    ...(theme?.bannerWidth === 'full' ? { '--lp-hero-inset': '0px', '--lp-hero-top': '0px', '--lp-hero-radius': '0px' } : {}),
  } as CSSProperties
}

// 按用途的默认图框比例（主题设置 › 默认图框比例）
export function defaultRatio(theme: Theme | null | undefined, usage: keyof NonNullable<Theme['defaultRatios']>): string {
  const ratios = theme?.defaultRatios
  const value = ratios?.[usage]
  if (value) return value
  return usage === 'videoCover' ? '16/9' : 'original'
}

// 主题 › 文字级别（第 4 点）→ 一段 CSS。前缀 :root:root:root 把优先级抬到 (0,3,x)，
// 高于各模块自己的标题样式；单段文字的“文字样式”是 (0,5,0)，仍然优先
const R = ':root:root:root'
// 深色背景上的文字保持白色，级别颜色不作用在这些地方。模块的深浅由 backgroundProps 加的
// lp-bg-dark / lp-bg-blue 表示（深色预设、自定义深色、背景图都会加）；另外两处固定是深色：首页横幅、底部联系条
const DARK = ':is(.lp-bg-dark, .lp-bg-blue, .lp-hero, .lp-contact-band)'
const LEVEL_SELECTORS: Record<string, string[]> = {
  pageTitle: ['h1', '.lp-h1'],
  // 产品卡片里的产品名也是 h2（ProductLineCard），不算模块标题；
  // 产品详情、案例详情里各小节（Equipment Features、FAQ、Customer Requirements 等）的标题是 .lp-article 里的 h3，也算模块标题；
  // 富文本正文（.lp-rich，包括隐私政策等法务页的条款标题、产品介绍里编辑加的小标题）里的 h3 不算
  sectionTitle: ['main h2:not(.lp-store-line *)', 'main .lp-article h3:not(.lp-rich *)', '.lp-contact-band h2'],
  kicker: ['.lp-kicker'],
  body: ['main p', 'main li', 'main .lp-rich'],
  button: ['.lp-action', '.lp-outline', '.lp-link', '.lp-store-blue-button'],
}

export function themeTextCss(theme: Theme | null | undefined): string {
  const levels = (theme as { textLevels?: Record<string, unknown> } | null | undefined)?.textLevels
  if (!levels) return ''
  return Object.entries(LEVEL_SELECTORS)
    .map(([level, selectors]) => {
      // 字段名是 级别 + Style（fields 里的 textStyleField 统一加的后缀）
      const style = cleanTextStyle(levels[`${level}Style`])
      if (!style) return ''
      const { color, ...rest } = style
      const all = selectors.map((s) => `${R} ${s}`).join(',')
      const light = selectors.map((s) => `${R} ${s}:not(${DARK} *)`).join(',')
      return textStyleCss(all, rest, { opacity: false }) + (color ? `${light}{color:${color}}` : '')
    })
    .join('')
}
