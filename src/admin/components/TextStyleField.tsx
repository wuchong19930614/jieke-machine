'use client'
// “文字样式”小面板（第 4、15 点）：平时收起只显示一行摘要，点开后设置字号（电脑 / 手机）、字体、颜色和透明度。
// 值存成 JSON；全部清空 = 跟随主题。TextStyleEditor 也被产品模块标题（ModuleTitles）直接复用
import { FieldError, useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import { useEffect, useRef, useState } from 'react'

import { HEX_COLOR as HEX, TEXT_STYLE_FONTS, TEXT_STYLE_SWATCHES } from '@/lib/constants'
import { MOBILE_SCALE, type TextStyle } from '@/lib/textStyle'

function summary(style: TextStyle | null | undefined): string {
  if (!style) return '跟随主题'
  const parts: string[] = []
  if (style.size || style.sizeMobile) parts.push(`字号 ${style.size ?? '默认'}${style.sizeMobile ? ` / 手机 ${style.sizeMobile}` : ''}`)
  if (style.font) parts.push(TEXT_STYLE_FONTS.find((f) => f.value === style.font)?.label ?? style.font)
  if (style.color) parts.push(style.color)
  if (style.weight) parts.push(style.weight === 700 ? '加粗' : '常规')
  if (style.opacity) parts.push(`透明度 ${style.opacity}%`)
  return parts.length ? parts.join(' · ') : '跟随主题'
}

export function TextStyleEditor({ path, target, opacity = true }: { path: string; target?: string; opacity?: boolean }) {
  const { value, setValue, showError } = useField<TextStyle | null>({ path })
  const style: TextStyle = value && typeof value === 'object' ? value : {}
  const [open, setOpen] = useState(false)
  // 连续修改（还没重新渲染）时也在最新的值上合并，避免后一次覆盖前一次
  const latest = useRef<TextStyle>(style)
  useEffect(() => {
    latest.current = value && typeof value === 'object' ? value : {}
  }, [value])
  const set = (patch: Partial<TextStyle>) => {
    const next: Record<string, unknown> = { ...latest.current, ...patch }
    for (const key of Object.keys(next)) if (next[key] === undefined || next[key] === '' || next[key] === null) delete next[key]
    latest.current = next as TextStyle
    setValue(Object.keys(next).length ? next : null)
  }
  const num = (raw: string) => (raw.trim() === '' ? undefined : Number(raw))
  const color = style.color && HEX.test(style.color) ? style.color : ''
  const autoMobile = style.size ? Math.round(style.size * MOBILE_SCALE) : undefined

  return (
    // id 与 Payload 字段的规则一致（field-路径），“定位到字段”才能找到这里
    <div id={`field-${path.replace(/\./g, '__')}`} className={`jk-ts${open ? ' jk-ts--open' : ''}${showError ? ' jk-ts--error' : ''}`}>
      <button type="button" className="jk-ts__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="jk-ts__caret" aria-hidden>
          {open ? '▾' : '▸'}
        </span>
        {target ? `“${target}”的文字样式` : '文字样式'}
        <span className="jk-ts__summary">{summary(value)}</span>
      </button>
      {open ? (
        <div className="jk-ts__panel">
          <label className="jk-ts__item">
            <span>电脑字号（px）</span>
            <input type="number" min={10} max={120} placeholder="跟随主题" value={style.size ?? ''} onChange={(e) => set({ size: num(e.target.value) })} />
          </label>
          <label className="jk-ts__item">
            <span>手机字号（px）</span>
            <input type="number" min={10} max={120} placeholder={autoMobile ? `自动 ${autoMobile}` : '跟随主题'} value={style.sizeMobile ?? ''} onChange={(e) => set({ sizeMobile: num(e.target.value) })} />
          </label>
          <label className="jk-ts__item">
            <span>字体</span>
            <select value={style.font ?? ''} onChange={(e) => set({ font: e.target.value || undefined })}>
              {TEXT_STYLE_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="jk-ts__item">
            <span>字重</span>
            <select value={style.weight ?? ''} onChange={(e) => set({ weight: e.target.value === '700' ? 700 : e.target.value === '400' ? 400 : undefined })}>
              <option value="">跟随主题</option>
              <option value="400">常规</option>
              <option value="700">加粗</option>
            </select>
          </label>
          <div className="jk-ts__item jk-ts__item--wide">
            <span>颜色</span>
            <div className="jk-ts__colors">
              <button type="button" className={`jk-ts__swatch jk-ts__swatch--none${!style.color ? ' is-active' : ''}`} onClick={() => set({ color: undefined })} title="跟随主题">
                默认
              </button>
              {TEXT_STYLE_SWATCHES.map((c) => (
                <button key={c} type="button" className={`jk-ts__swatch${style.color === c ? ' is-active' : ''}`} style={{ background: c }} onClick={() => set({ color: c })} title={c} aria-label={`颜色 ${c}`} />
              ))}
              {/* 没选颜色时色块显示成“未选”，避免把色盘的初始颜色当成已选（直接确认初始颜色不会触发 onChange） */}
              <span className={`jk-picker${color ? '' : ' jk-picker--empty'}`}>
                <input
                  type="color"
                  value={color || '#142b42'}
                  onChange={(e) => set({ color: e.target.value.toUpperCase() })}
                  title={color ? '用色盘选择其他颜色' : '还没选颜色：点这里用色盘选，或点左边的色板'}
                  aria-label="用色盘选择颜色"
                />
              </span>
              <input type="text" className="jk-ts__hex" placeholder="#FFFFFF" value={style.color ?? ''} onChange={(e) => set({ color: e.target.value.trim() || undefined })} />
            </div>
          </div>
          {opacity ? (
            <label className="jk-ts__item jk-ts__item--wide">
              <span>透明度 {style.opacity ?? 100}%</span>
              <input type="range" min={10} max={100} step={5} value={style.opacity ?? 100} onChange={(e) => set({ opacity: Number(e.target.value) >= 100 ? undefined : Number(e.target.value) })} />
            </label>
          ) : null}
          <div className="jk-ts__foot">
            <span>不填的项跟随“主题 › 文字级别”；手机字号不填时自动用电脑字号的 85%。</span>
            <button
              type="button"
              className="jk-ts__reset"
              onClick={() => {
                latest.current = {}
                setValue(null)
              }}
            >
              恢复跟随主题
            </button>
          </div>
        </div>
      ) : null}
      <FieldError path={path} showError={showError} />
    </div>
  )
}

export const TextStyleField: JSONFieldClientComponent = (props) => {
  const { path } = props
  const extra = props as unknown as { opacity?: boolean; target?: string }
  return <TextStyleEditor path={path} target={extra.target} opacity={extra.opacity !== false} />
}
