'use client'
// 数字滑块（如背景图遮罩深浅）：拖动调整，右边显示当前数值
import { FieldDescription, FieldLabel, useField } from '@payloadcms/ui'
import type { NumberFieldClientComponent } from 'payload'

export const RangeField: NumberFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<number>({ path })
  const min = field.min ?? 0
  const max = field.max ?? 100
  const step = Number(field.admin?.step ?? 1)
  // 新建的行由表单填入默认值；万一没有值时按最小值显示
  const current = typeof value === 'number' ? value : min
  const description = typeof field.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className="field-type jk-range">
      <FieldLabel label={field.label} path={path} />
      <div className="jk-range__row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label={typeof field.label === 'string' ? field.label : undefined}
        />
        <output>{current}%</output>
      </div>
      {description ? <FieldDescription description={description} path={path} /> : null}
    </div>
  )
}
