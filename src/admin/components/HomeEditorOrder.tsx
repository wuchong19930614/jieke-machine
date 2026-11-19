'use client'

import { useFormFields } from '@payloadcms/ui'

import { HOME_SECTIONS } from '@/lib/constants'

export function HomeEditorOrder() {
  const order = useFormFields(([fields]) => Object.keys(fields)
    .filter((path) => /^sections\.\d+\.module$/.test(path))
    .sort((a, b) => Number(a.split('.')[1]) - Number(b.split('.')[1]))
    .map((path) => fields[path]?.value)
    .join(','))
  const modules = [...new Set([...order.split(','), ...HOME_SECTIONS.map(({ value }) => value)])]
  // 只使用固定字段名生成 CSS。原有字段路径和表单状态不随拖动变化。
  const scope = '.render-fields:has(> #field-sections):has(> #field-banners)'
  const rules = HOME_SECTIONS.map(({ value }) => `${scope} > #field-${value} { order: ${modules.indexOf(value) + 1}; }`)

  return <style>{[
    `${scope} { display: flex; flex-direction: column; reading-flow: flex-visual; }`,
    ...rules,
    `${scope} > #field-inquiry { order: ${modules.length + 1}; }`,
    `${scope} > .jk-home-seo { order: ${modules.length + 2}; }`,
  ].join('\n')}</style>
}
