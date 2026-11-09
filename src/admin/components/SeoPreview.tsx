'use client'
// SEO 分组最下面：按当前填写的内容预览 Google 搜索结果和分享卡片，让人看到这些设置到底影响哪里
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'

type MediaRef = number | string | { id?: number | string; url?: string | null } | null | undefined

// 没上传分享预览图时，前台用哪张图代替（与各页面传给 lib/seo.tsx buildMetadata 的 image 一致）：
// 产品用列表图，没有时用横幅图；案例用封面图；其他页面用全站默认分享图
const FALLBACK_FIELDS: Record<string, { field: string; label: string }[]> = {
  products: [
    { field: 'listImage', label: '本产品的列表图' },
    { field: 'heroImage', label: '本产品的横幅图' },
  ],
  cases: [{ field: 'coverImage', label: '本案例的封面图' }],
}

// 分享预览图在表单里可能只是媒体编号，需要再查一次地址。结果按编号记住：
// 换成另一张图时不会先显示上一张，读取失败时显示“无法预览”而不是留着旧图
function useMediaUrl(value: MediaRef): { url: string | null; failed: boolean } {
  const id = value && typeof value === 'object' ? value.id : value
  const direct = value && typeof value === 'object' ? (value.url ?? null) : null
  const [result, setResult] = useState<{ id: number | string; url: string | null; failed: boolean } | null>(null)
  useEffect(() => {
    if (direct || !id) return
    let cancelled = false
    fetch(`/api/cms/media/${id}?depth=0`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((doc: { url?: string }) => {
        if (!cancelled) setResult({ id, url: doc?.url ?? null, failed: false })
      })
      .catch(() => {
        if (!cancelled) setResult({ id, url: null, failed: true })
      })
    return () => {
      cancelled = true
    }
  }, [id, direct])
  if (direct) return { url: direct, failed: false }
  if (!id || result?.id !== id) return { url: null, failed: false }
  return { url: result.url, failed: result.failed }
}

export const SeoPreview: UIFieldClientComponent = ({ path }) => {
  const base = path.replace(/\.?seoPreview$/, '')
  const at = (name: string) => (base ? `${base}.${name}` : name)
  const { collectionSlug } = useDocumentInfo()
  const title = useFormFields(([fields]) => fields[at('seoTitle')]?.value as string | undefined)
  const description = useFormFields(([fields]) => fields[at('seoDescription')]?.value as string | undefined)
  const image = useFormFields(([fields]) => fields[at('ogImage')]?.value as MediaRef)
  const noindex = useFormFields(([fields]) => fields[at('noindex')]?.value as boolean | undefined)
  // 代替图：按顺序取第一张已上传的
  const candidates = FALLBACK_FIELDS[collectionSlug ?? ''] ?? []
  // 每类记录最多两张代替图；分开读取，选出来的是原值，表单别处改动时不会让预览跟着重新渲染
  const first = useFormFields(([fields]) => (candidates[0] ? (fields[candidates[0].field]?.value as MediaRef) : undefined))
  const second = useFormFields(([fields]) => (candidates[1] ? (fields[candidates[1].field]?.value as MediaRef) : undefined))
  const fallbackValues = [first, second]
  const fallbackIndex = fallbackValues.findIndex((v, i) => Boolean(v) && i < candidates.length)
  const fallback = fallbackIndex >= 0 ? candidates[fallbackIndex] : null
  const own = useMediaUrl(image)
  const substitute = useMediaUrl(image ? null : fallbackIndex >= 0 ? fallbackValues[fallbackIndex] : null)
  const shown = image ? own : substitute
  const host = typeof window === 'undefined' ? '' : window.location.host
  const shownTitle = title?.trim() || '（未填写：自动用页面标题）'
  const shownDescription = description?.trim() || '（未填写：自动用页面简介）'
  const imageNote = !image && fallback ? `未上传分享预览图：自动用${fallback.label}` : null

  return (
    <div className="jk-seo">
      <p className="jk-seo__label">效果预览（按上面填写的内容实时变化）</p>
      <div className="jk-seo__google">
        <span className="jk-seo__host">{host}</span>
        <span className="jk-seo__title">{shownTitle}</span>
        <span className="jk-seo__desc">{shownDescription}</span>
        {noindex ? <span className="jk-seo__noindex">已勾选“禁止搜索引擎收录”：这一页不会出现在搜索结果里</span> : null}
      </div>
      <div className="jk-seo__card">
        {shown.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- 后台预览直接显示媒体地址
          <img src={shown.url} alt="" />
        ) : (
          <div className="jk-seo__noimg">
            {shown.failed ? '图片地址读取失败，暂时无法预览（不影响前台）' : image || fallback ? '正在读取图片…' : '未上传分享预览图：自动用全站默认分享图'}
          </div>
        )}
        <div className="jk-seo__cardtext">
          <b>{shownTitle}</b>
          <span>{host}</span>
          {imageNote ? <span className="jk-seo__imgnote">{imageNote}</span> : null}
        </div>
      </div>
      <p className="jk-seo__hint">左边模拟 Google 搜索结果，右边模拟发到 WhatsApp、Facebook 时的预览卡片。实际显示会因平台略有差别。</p>
    </div>
  )
}
