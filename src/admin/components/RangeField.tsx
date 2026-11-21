'use client'
// 数字滑块（如背景图遮罩深浅）：拖动调整，右边显示当前数值
import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import type { NumberFieldClientComponent } from 'payload'

export const RangeField: NumberFieldClientComponent = ({ path, field, readOnly }) => {
  const { value, setValue, showError } = useField<number | null>({ path })
  const min = field.min ?? 0
  const max = field.max ?? 100
  const step = Number(field.admin?.step ?? 1)
  const exactInput = field.admin?.custom?.rangeNumberInput === true
  const fallback = Number(field.admin?.custom?.rangeFallback ?? min)
  const unit = field.admin?.custom?.rangeUnit === 'px' ? ' px' : '%'
  const current = typeof value === 'number' ? value : fallback
  const label = typeof field.label === 'string' ? field.label : path
  const description = typeof field.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className="field-type jk-range">
      <FieldLabel label={field.label} path={path} />
      {showError ? <FieldError path={path} showError={showError} /> : null}
      <div className="jk-range__row">
        <input
          type="range"
          disabled={readOnly}
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label={exactInput ? `${label}滑块` : label}
        />
        {exactInput ? (
          <input
            className="jk-range__number"
            id={`field-${path.replace(/\./g, '__')}`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value ?? ''}
            placeholder={String(fallback)}
            disabled={readOnly}
            aria-label={label}
            onChange={(event) => setValue(Number.isFinite(event.currentTarget.valueAsNumber) ? event.currentTarget.valueAsNumber : null)}
          />
        ) : <output>{current}{unit}</output>}
      </div>
      {description ? <FieldDescription description={description} path={path} /> : null}
    </div>
  )
}
