import type { CSSProperties } from 'react'

import type { SiteSetting } from '@/payload-types'

import { BREADCRUMB_FONT_SIZE_MAX, BREADCRUMB_FONT_SIZE_MIN } from './constants'
import { fontFamily } from './textStyle'

function size(value: number | null | undefined): string | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return `${Math.min(BREADCRUMB_FONT_SIZE_MAX, Math.max(BREADCRUMB_FONT_SIZE_MIN, value))}px`
}

export function breadcrumbStyle(layout: SiteSetting['breadcrumbLayout']): CSSProperties {
  return {
    '--breadcrumb-font': layout?.font ? fontFamily(layout.font) : undefined,
    '--breadcrumb-size': size(layout?.fontSize),
    '--breadcrumb-size-mobile': size(layout?.fontSizeMobile),
  } as CSSProperties
}
