export const MIN_BASE_FONT_SIZE = 10
export const MAX_BASE_FONT_SIZE = 24
export const DEFAULT_BASE_FONT_SIZE = 14

const LEGACY_SCALE = { small: 0.93, standard: 1, large: 1.08 } as const

export function baseFontSize(size: unknown, legacy: unknown): number {
  if (typeof size === 'number' && Number.isInteger(size) && size >= MIN_BASE_FONT_SIZE && size <= MAX_BASE_FONT_SIZE) return size
  if (legacy === 'small') return 13
  if (legacy === 'large') return 15
  return DEFAULT_BASE_FONT_SIZE
}

export function fontScale(size: number | null | undefined, legacy: keyof typeof LEGACY_SCALE | null | undefined) {
  return size == null ? (LEGACY_SCALE[legacy ?? 'standard'] ?? 1) : baseFontSize(size, legacy) / DEFAULT_BASE_FONT_SIZE
}
