// 参数表（技术方案 3.4、4.4）：多型号对比，只显示公开的行；手机上可横向滑动，参数名列固定
import { normalizeSpecTable, publicRows } from '@/lib/specTable'

type Props = { value: unknown; texts: { specsModel: string; specsSwipe: string; specsEmpty: string }; caption: string }

export function SpecTable({ value, texts, caption }: Props) {
  const table = normalizeSpecTable(value)
  const rows = publicRows(table)
  if (!rows.length || !table.models.length) return null
  return (
    <>
      {table.models.length > 1 ? <p className="lp-specs-hint">{texts.specsSwipe}</p> : null}
      <div className="lp-specs-wrap">
        <table className="lp-specs">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{texts.specsModel}</th>
              {table.models.map((model) => (
                <th key={model.id} scope="col">
                  {model.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                {table.models.map((model) => (
                  <td key={model.id}>{row.values[model.id] || texts.specsEmpty}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
