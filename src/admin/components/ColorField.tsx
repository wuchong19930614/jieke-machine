'use client'
// 自定义背景色：左边色盘直接选，右边也可以手动输入色号（两边同步）
import { TextInput, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

import { HEX_COLOR as HEX } from '@/lib/constants'

export const ColorField: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue, showError } = useField<string>({ path })
  const text = value ?? ''
  const picked = HEX.test(text.trim()) ? text.trim() : '#eaf2fb'
  const description = typeof field.admin?.description === 'string' ? field.admin.description : undefined
  const placeholder = typeof field.admin?.placeholder === 'string' ? field.admin.placeholder : undefined

  return (
    <TextInput
      className="jk-color"
      path={path}
      value={text}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      label={field.label}
      description={description}
      placeholder={placeholder}
      required={field.required}
      showError={showError}
      BeforeInput={
        // 还没填色号时色块显示成“未选”（变淡加斜线），避免把色盘的初始颜色当成已经选好：
        // 色盘里直接确认初始颜色不会触发 onChange，看起来选了其实没保存
        <span className={`jk-picker${HEX.test(text.trim()) ? '' : ' jk-picker--empty'}`}>
          <input
            type="color"
            className="jk-color__picker"
            value={picked}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            aria-label="用色盘选择颜色"
            title={HEX.test(text.trim()) ? '点这里用色盘选颜色' : '还没选颜色：点这里用色盘选，或在右边输入色号'}
          />
        </span>
      }
    />
  )
}
