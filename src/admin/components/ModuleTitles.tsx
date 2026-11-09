'use client'
// 产品详情各模块分组最上面的“本模块标题”输入框（第 15 点）。
// 数据仍存在 sectionTexts（模块文案覆盖）里，这里只是把输入框放到对应模块旁边；输入框 id 与原字段一致，前台点选定位照常可用
import { TextInput, useConfig, useField } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'

import { isButtonTextKey } from '@/lib/textStyle'

import { TextStyleEditor } from './TextStyleField'

type Item = { key: string; label: string; placeholder: string; styled?: boolean }
type ProductTexts = Record<string, unknown>

// “界面文案 › 产品详情模板”的已发布内容。同一页有十几个模块分组，几秒内的请求共用一次；
// 过了这段时间（比如去改了界面文案再回到产品页）重新请求，失败的结果不留，下次打开会重试
const REUSE_MS = 10_000
let productTextsCache: { at: number; request: Promise<ProductTexts | null> } | null = null
function loadProductTexts(api: string): Promise<ProductTexts | null> {
  if (productTextsCache && Date.now() - productTextsCache.at < REUSE_MS) return productTextsCache.request
  const request = fetch(`${api}/globals/ui-texts?depth=0`, { credentials: 'include' })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`读取界面文案失败：${res.status}`))))
    .then((doc: { product?: ProductTexts } | null) => doc?.product ?? null)
  const entry = { at: Date.now(), request: request.catch(() => null) }
  productTextsCache = entry
  // 请求失败时清掉缓存（只清自己这次的），占位字暂时用代码里的初始文字
  request.catch(() => {
    if (productTextsCache === entry) productTextsCache = null
  })
  return entry.request
}

// 灰色占位字显示前台实际会用的全站文字：界面文案里改过就用改后的，勾了隐藏就提示隐藏，都没有时用代码里的初始文字
function sitewideText(item: Item, texts: ProductTexts | null): string {
  if (texts?.[`${item.key}Hidden`] === true) return '（全站已隐藏）'
  const value = texts?.[item.key]
  if (typeof value === 'string' && value.trim()) return value
  return item.placeholder || '（默认不显示）'
}

function TitleInput({ item, texts }: { item: Item; texts: ProductTexts | null }) {
  const path = `sectionTexts.${item.key}`
  const { value, setValue } = useField<string>({ path })
  return (
    <div>
      <TextInput
        path={path}
        value={value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        label={item.label}
        placeholder={sitewideText(item, texts)}
      />
      {item.styled ? <TextStyleEditor path={`${path}Style`} target={item.label} opacity={!isButtonTextKey(item.key)} /> : null}
    </div>
  )
}

export const ModuleTitles: UIFieldClientComponent = (props) => {
  const items = ((props as unknown as { items?: Item[] }).items ?? []).filter((item) => item.key)
  const { config } = useConfig()
  const [texts, setTexts] = useState<ProductTexts | null>(null)
  useEffect(() => {
    let cancelled = false
    void loadProductTexts(`${config.serverURL ?? ''}${config.routes.api}`).then((result) => {
      if (!cancelled) setTexts(result)
    })
    return () => {
      cancelled = true
    }
  }, [config.serverURL, config.routes.api])
  if (!items.length) return null
  return (
    <div className="jk-module-titles">
      <p className="jk-module-titles__head">本模块标题和按钮文字</p>
      <div className="jk-module-titles__grid">
        {items.map((item) => (
          <TitleInput key={item.key} item={item} texts={texts} />
        ))}
      </div>
      <p className="jk-module-titles__hint">灰色字是现在全站统一显示的文字（在“界面文案 › 产品详情模板”里改，所有产品一起变）；在这里填写只改本产品，清空就恢复全站文字。</p>
    </div>
  )
}
