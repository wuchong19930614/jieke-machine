'use client'

import { FieldDescription, FieldError, FieldLabel, useDocumentInfo, useField } from '@payloadcms/ui'
import type { NumberFieldClientComponent } from 'payload'

import { baseFontSize, MAX_BASE_FONT_SIZE, MIN_BASE_FONT_SIZE } from '@/lib/fontSize'

export const FontSizeField: NumberFieldClientComponent = ({ path, field, readOnly }) => {
  const { value, setValue, initialValue, showError } = useField<number | null>({ path })
  const { data } = useDocumentInfo()
  const current = baseFontSize(value, data?.fontScale)
  const saved = baseFontSize(initialValue, data?.fontScale)
  const previous = typeof data?.previousBaseFontSize === 'number' ? data.previousBaseFontSize : null
  const restoreTo = current !== saved ? saved : previous

  return (
    <div className="field-type jk-range">
      <FieldLabel label={field.label} path={path} />
      {showError ? <FieldError path={path} /> : null}
      <div className="jk-font-size-controls">
        <button type="button" aria-label="缩小字号" disabled={readOnly || current <= MIN_BASE_FONT_SIZE} onClick={() => setValue(current - 1)}>−</button>
        <output aria-live="polite">{current} px</output>
        <button type="button" aria-label="放大字号" disabled={readOnly || current >= MAX_BASE_FONT_SIZE} onClick={() => setValue(current + 1)}>＋</button>
        <button type="button" disabled={readOnly || restoreTo == null || restoreTo === current} onClick={() => { if (restoreTo != null) setValue(restoreTo) }}>
          {current !== saved ? '撤销未保存的字号修改' : '恢复上一版字号'}
        </button>
      </div>
      {typeof field.admin?.description === 'string' ? <FieldDescription description={field.admin.description} path={path} /> : null}
    </div>
  )
}
