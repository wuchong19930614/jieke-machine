'use client'
// 参数表编辑器（技术方案 3.4）：像电子表格一样增删和调整型号列、参数行，数值按型号 id 保存
import { Button, FieldLabel, useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import { useMemo, useRef } from 'react'

import { newId, normalizeSpecTable, type SpecTable } from '@/lib/specTable'

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export const SpecTableField: JSONFieldClientComponent = ({ path, field }) => {
  const { value, setValue, errorMessage, showError } = useField<SpecTable>({ path })
  const table = useMemo(() => normalizeSpecTable(value, { trim: false }), [value])
  const update = (next: SpecTable) => setValue(next)
  const description = typeof field.admin?.description === 'string' ? field.admin.description : undefined
  const box = useRef<HTMLDivElement>(null)

  // 新增型号列时直接填好型号名，避免把灰色示例当成已填、保存时才被拦下；
  // 序号取第一个没被用过的（删过中间的列再新增时不会和现有型号重名）
  const addModel = () => {
    const used = new Set(table.models.map((m) => m.name.trim()))
    let n = table.models.length + 1
    while (used.has(`Model ${n}`)) n++
    update({ ...table, models: [...table.models, { id: newId('m'), name: `Model ${n}` }] })
  }
  // 报错旁的按钮：滚动到第一个没填的输入框并聚焦
  const focusEmpty = () => {
    const input = box.current?.querySelector<HTMLInputElement>('.jk-spec__input--empty')
    input?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    input?.focus()
  }
  const removeModel = (id: string) => {
    if (!window.confirm('删除这个型号会同时删除该列的所有数值，确定吗？')) return
    update({
      models: table.models.filter((m) => m.id !== id),
      rows: table.rows.map((r) => {
        const values = { ...r.values }
        delete values[id]
        return { ...r, values }
      }),
    })
  }
  const addRow = () => update({ ...table, rows: [...table.rows, { id: newId('r'), label: '', public: false, values: {} }] })

  return (
    <div className="field-type jk-spec" id={`field-${path.replace(/\./g, '__')}`} ref={box}>
      <FieldLabel label={typeof field.label === 'string' ? field.label : '参数表'} path={path} />
      {description ? <p className="jk-spec__desc">{description}</p> : null}
      {showError && errorMessage ? (
        <p className="jk-spec__error">
          {errorMessage}
          {table.models.some((m) => !m.name.trim()) || table.rows.some((r) => !r.label.trim()) ? (
            <button type="button" className="jk-spec__jump" onClick={focusEmpty}>
              跳到没填的位置
            </button>
          ) : null}
        </p>
      ) : null}
      <div className="jk-spec__scroll">
        <table className="jk-spec__table">
          <thead>
            <tr>
              <th className="jk-spec__ctrl">排序</th>
              <th>参数名（单位写在括号里）</th>
              <th className="jk-spec__public">公开</th>
              {table.models.map((model, index) => (
                <th key={model.id}>
                  <input
                    className={`jk-spec__input${model.name.trim() ? '' : ' jk-spec__input--empty'}`}
                    value={model.name}
                    placeholder={`型号 ${index + 1}，如 LT-300`}
                    onChange={(e) =>
                      update({ ...table, models: table.models.map((m) => (m.id === model.id ? { ...m, name: e.target.value } : m)) })
                    }
                  />
                  {model.name.trim() ? null : <span className="jk-spec__required">必填：型号名</span>}
                  <div className="jk-spec__colctrl">
                    <button type="button" title="左移" onClick={() => update({ ...table, models: move(table.models, index, index - 1) })}>
                      ←
                    </button>
                    <button type="button" title="右移" onClick={() => update({ ...table, models: move(table.models, index, index + 1) })}>
                      →
                    </button>
                    <button type="button" title="删除型号" onClick={() => removeModel(model.id)}>
                      ×
                    </button>
                  </div>
                </th>
              ))}
              <th className="jk-spec__ctrl" />
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={row.id} className={row.public ? '' : 'jk-spec__row--private'}>
                <td className="jk-spec__ctrl">
                  <button type="button" title="上移" onClick={() => update({ ...table, rows: move(table.rows, index, index - 1) })}>
                    ↑
                  </button>
                  <button type="button" title="下移" onClick={() => update({ ...table, rows: move(table.rows, index, index + 1) })}>
                    ↓
                  </button>
                </td>
                <td>
                  <input
                    className={`jk-spec__input${row.label.trim() ? '' : ' jk-spec__input--empty'}`}
                    value={row.label}
                    placeholder="如 Capacity (kg/h)"
                    onChange={(e) => update({ ...table, rows: table.rows.map((r) => (r.id === row.id ? { ...r, label: e.target.value } : r)) })}
                  />
                </td>
                <td className="jk-spec__public">
                  <input
                    type="checkbox"
                    checked={row.public}
                    aria-label="在前台公开这一行"
                    onChange={(e) => update({ ...table, rows: table.rows.map((r) => (r.id === row.id ? { ...r, public: e.target.checked } : r)) })}
                  />
                </td>
                {table.models.map((model) => (
                  <td key={model.id}>
                    <input
                      className="jk-spec__input"
                      value={row.values[model.id] ?? ''}
                      onChange={(e) =>
                        update({
                          ...table,
                          rows: table.rows.map((r) => (r.id === row.id ? { ...r, values: { ...r.values, [model.id]: e.target.value } } : r)),
                        })
                      }
                    />
                  </td>
                ))}
                <td className="jk-spec__ctrl">
                  <button type="button" title="删除这一行" onClick={() => update({ ...table, rows: table.rows.filter((r) => r.id !== row.id) })}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="jk-spec__actions">
        <Button buttonStyle="secondary" size="small" onClick={addModel}>
          添加型号列
        </Button>
        <Button buttonStyle="secondary" size="small" onClick={addRow}>
          添加参数行
        </Button>
      </div>
      <p className="jk-spec__desc">灰色行表示不公开，前台不显示；某个型号没有填写的单元格，前台显示“—”。</p>
    </div>
  )
}
