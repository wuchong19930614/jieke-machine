// 文字样式（第 4、15 点）：后台“文字样式”保存的 JSON → 前台 CSS。
// 只接受范围内的数字、# 色号和内置字体键，生成的 CSS 不会混进任意内容
export type TextStyle = { size?: number; sizeMobile?: number; font?: string; color?: string; opacity?: number }

// 按钮类文案（键名里带 button）不提供透明度：透明度会连按钮底色一起变淡
export const isButtonTextKey = (key: string): boolean => /button/i.test(key)

export const TEXT_SIZE_MIN = 10
export const TEXT_SIZE_MAX = 120
// 手机字号没填时按电脑字号的 85%（大标题在手机上原样显示会太挤）
export const MOBILE_SCALE = 0.85

import { HEX_COLOR as HEX } from './constants'

const FONT_KEYS = ['system', 'inter', 'montserrat', 'open-sans'] as const
const SYSTEM = "Arial, 'Helvetica Neue', Helvetica, sans-serif"
// 与前台布局里 next/font 生成的变量名一致（app/(frontend)/layout.tsx）
export const FONT_VARS: Record<string, string> = { inter: '--font-inter', montserrat: '--font-montserrat', 'open-sans': '--font-open-sans' }

const sizeOf = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) && v >= TEXT_SIZE_MIN && v <= TEXT_SIZE_MAX ? Math.round(v) : undefined

// 清洗：不合规的项直接丢掉；什么都没设时返回 null（= 跟随主题）
export function cleanTextStyle(value: unknown): TextStyle | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  const style: TextStyle = {}
  const size = sizeOf(v.size)
  const sizeMobile = sizeOf(v.sizeMobile)
  if (size) style.size = size
  if (sizeMobile) style.sizeMobile = sizeMobile
  if (typeof v.font === 'string' && (FONT_KEYS as readonly string[]).includes(v.font)) style.font = v.font
  if (typeof v.color === 'string' && HEX.test(v.color.trim())) style.color = v.color.trim().toUpperCase()
  if (typeof v.opacity === 'number' && v.opacity >= 10 && v.opacity < 100) style.opacity = Math.round(v.opacity)
  return Object.keys(style).length ? style : null
}

// 后台保存前的校验：说清楚哪一项不对
export function validateTextStyle(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  if (typeof value !== 'object') return '文字样式格式不对，请点“恢复跟随主题”后重新设置'
  const v = value as Record<string, unknown>
  for (const [key, label] of [
    ['size', '电脑字号'],
    ['sizeMobile', '手机字号'],
  ] as const) {
    if (v[key] !== undefined && v[key] !== null && !sizeOf(v[key])) return `${label}请填 ${TEXT_SIZE_MIN}–${TEXT_SIZE_MAX} 之间的数字（单位 px）`
  }
  if (v.color && !(typeof v.color === 'string' && HEX.test(v.color.trim()))) return '颜色请填 # 开头的 6 位色号，例如 #FFFFFF'
  return true
}

const fontFamily = (key: string): string => (key !== 'system' && FONT_VARS[key] ? `var(${FONT_VARS[key]}), ${SYSTEM}` : SYSTEM)

// 一条样式 → 电脑端声明和手机端声明（手机只放字号）
export function textStyleDeclarations(style: TextStyle, { opacity = true } = {}): { desktop: string; mobile: string } {
  const desktop: string[] = []
  if (style.size) desktop.push(`font-size:${style.size}px`)
  if (style.font) desktop.push(`font-family:${fontFamily(style.font)}`)
  if (style.color) desktop.push(`color:${style.color}`)
  if (opacity && style.opacity) desktop.push(`opacity:${style.opacity / 100}`)
  const mobileSize = style.sizeMobile ?? (style.size ? Math.max(TEXT_SIZE_MIN, Math.round(style.size * MOBILE_SCALE)) : undefined)
  return { desktop: desktop.join(';'), mobile: mobileSize ? `font-size:${mobileSize}px` : '' }
}

export function textStyleCss(selector: string, style: TextStyle, options?: { opacity?: boolean }): string {
  const { desktop, mobile } = textStyleDeclarations(style, options)
  return [desktop ? `${selector}{${desktop}}` : '', mobile ? `@media (max-width:767px){${selector}{${mobile}}}` : ''].join('')
}

// 稳定的短 id（同一字段每次渲染相同），用作 data-ts 属性值
export function textStyleId(key: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

// 单段文字的选择器：重复属性把优先级抬到 (0,5,0)，高于各模块自己的标题样式和主题分级设置
export const textStyleSelector = (id: string): string => `[data-ts="${id}"]`.repeat(5)

// 在一条记录的数据里找出所有“xxxStyle”，返回 { 字段路径（去掉 Style）: 样式 }。
// 不进入关联进来的其他记录（有 createdAt 的对象），它们的样式由各自页面处理
export function collectTextStyles(data: unknown, prefix = '', out: Record<string, TextStyle> = {}): Record<string, TextStyle> {
  if (!data || typeof data !== 'object') return out
  if (Array.isArray(data)) {
    data.forEach((item, index) => collectTextStyles(item, `${prefix}${index}.`, out))
    return out
  }
  const record = data as Record<string, unknown>
  if (prefix && 'createdAt' in record) return out
  for (const [key, value] of Object.entries(record)) {
    if (key.endsWith('Style') && key.length > 5 && value && typeof value === 'object' && !Array.isArray(value)) {
      const style = cleanTextStyle(value)
      if (style) out[`${prefix}${key.slice(0, -5)}`] = style
    } else if (value && typeof value === 'object') {
      collectTextStyles(value, `${prefix}${key}.`, out)
    }
  }
  return out
}
