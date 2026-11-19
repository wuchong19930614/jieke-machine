import { TEXT_STYLE_SWATCHES } from './constants'
import { FONT_VARS } from './textStyle'

export const richTextStyles = {
  color: Object.fromEntries(TEXT_STYLE_SWATCHES.map((color) => [color, { label: color, css: { color } }])),
  fontSize: Object.fromEntries([12, 14, 16, 18, 20, 24, 32, 40, 48].map((size) => [String(size), { label: `${size} px`, css: { 'font-size': `${size}px` } }])),
  fontFamily: {
    system: { label: '系统字体', css: { 'font-family': 'Arial, sans-serif' } },
    ...Object.fromEntries(Object.entries(FONT_VARS).map(([key, variable]) => [key, {
      label: key,
      css: { 'font-family': `var(${variable}, ${key === 'open-sans' ? 'Open Sans' : key}), Arial, sans-serif` },
    }])),
  },
}
