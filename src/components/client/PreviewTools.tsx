'use client'
// 后台预览专用（只在草稿模式下渲染）：保存草稿后自动刷新；前台定位模式（技术方案 5.3 第 2、6 点）
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { adminUrl, type DocKey, isLocateMessage, LOCATE_SOURCE, NEW_DOC_REF } from '@/lib/locate'

const allowed = (value: unknown): boolean => {
  if (value === true) return true
  if (value && typeof value === 'object' && 'permission' in value) return Boolean((value as { permission: unknown }).permission)
  return Boolean(value)
}

// 当前账号能否编辑这条内容：按具体记录查询。受限编辑的权限是按记录 ID 的条件，
// 集合级权限会显示为“可编辑”，只看集合级会让他们跳到范围外的记录
// 查询失败时要和“没有权限”分开：登录过期、断网都提示“没有编辑权限”会让人以为是账号问题
type EditCheck = 'yes' | 'no' | 'expired' | 'offline'

async function fetchJson(url: string, init?: RequestInit): Promise<{ data?: Record<string, unknown>; status: 'ok' | 'expired' | 'offline' }> {
  try {
    const res = await fetch(url, { credentials: 'include', ...init })
    if (res.status === 401) return { status: 'expired' }
    if (!res.ok) return { status: 'offline' }
    return { data: (await res.json()) as Record<string, unknown>, status: 'ok' }
  } catch {
    return { status: 'offline' }
  }
}

async function fetchCanEdit(doc: DocKey): Promise<EditCheck> {
  const [kind, ref] = doc.split(':')
  // 还没有记录的内容：看能否在这个集合里新建
  if (ref === NEW_DOC_REF) {
    const { data, status } = await fetchJson('/api/cms/access')
    if (status !== 'ok') return status
    const collections = data?.collections as Record<string, { create?: unknown }> | undefined
    return allowed(collections?.[kind]?.create) ? 'yes' : 'no'
  }
  const url = kind === 'global' ? `/api/cms/globals/${ref}/access` : `/api/cms/${kind}/access/${encodeURIComponent(ref)}`
  const { data, status } = await fetchJson(url, { method: 'POST' })
  if (status !== 'ok') return status
  return allowed(data?.update) ? 'yes' : 'no'
}

const EDIT_CHECK_TEXT: Record<Exclude<EditCheck, 'yes'>, string> = {
  no: '没有编辑权限：当前账号不能修改这个内容',
  expired: '登录已过期：请回到后台刷新页面、重新登录后再试',
  offline: '暂时无法确认编辑权限：网络连接失败或服务器出错，请稍后再试',
}

function findLocateElement(doc: string, path: string): HTMLElement | null {
  const exact = document.querySelector<HTMLElement>(`[data-locate="${CSS.escape(`${doc}#${path}`)}"]`)
  if (exact) return exact
  // 字段本身没有单独显示（例如列表整体、分组）时，找以这个路径开头的第一个元素
  const all = Array.from(document.querySelectorAll<HTMLElement>('[data-locate]'))
  return all.find((el) => el.dataset.locate?.startsWith(`${doc}#${path}.`)) ?? all.find((el) => el.dataset.locate?.startsWith(`${doc}#${path}`)) ?? null
}

// 只滚动预览页自身：在后台实时预览的 iframe 里，scrollIntoView 会连带滚动外层的后台页面
function scrollToCenter(el: HTMLElement) {
  let node = el.parentElement
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node)
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
      const offset = el.getBoundingClientRect().top - node.getBoundingClientRect().top
      node.scrollBy({ top: offset - node.clientHeight / 2 + el.offsetHeight / 2, behavior: 'smooth' })
    }
    node = node.parentElement
  }
  const rect = el.getBoundingClientRect()
  window.scrollBy({ top: rect.top - window.innerHeight / 2 + rect.height / 2, behavior: 'smooth' })
}

function reveal(el: HTMLElement) {
  // 让轮播、步骤切换、弹窗、FAQ 等容器先切换到包含这个元素的状态
  el.dispatchEvent(new CustomEvent('jieke:reveal', { bubbles: true }))
  let node: HTMLElement | null = el
  while (node) {
    if (node instanceof HTMLDetailsElement) node.open = true
    node = node.parentElement
  }
  window.setTimeout(() => {
    scrollToCenter(el)
    el.classList.add('lp-locate-flash')
    window.setTimeout(() => el.classList.remove('lp-locate-flash'), 2400)
  }, 350)
}

export function PreviewTools({ serverURL }: { serverURL: string }) {
  const router = useRouter()
  const refresh = useCallback(() => router.refresh(), [router])
  const [locating, setLocating] = useState(false)
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null)
  const hovered = useRef<HTMLElement | null>(null)
  const editable = useRef(new Map<DocKey, EditCheck>())
  const inFrame = typeof window !== 'undefined' && window.parent !== window

  // 后台→前台：接收“在前台定位”消息
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isLocateMessage(event.data) || event.data.action !== 'reveal') return
      const el = findLocateElement(event.data.doc, event.data.path)
      if (el) reveal(el)
      ;(event.source as Window | null)?.postMessage({ source: LOCATE_SOURCE, action: 'reveal-result', found: Boolean(el) }, event.origin)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // 前台→后台：定位模式下悬停显示字段名，点击跳到后台字段
  useEffect(() => {
    document.body.classList.toggle('lp-locating', locating)
    if (!locating) {
      hovered.current?.classList.remove('lp-locate-hover')
      return
    }
    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-locate]') ?? null
      if (hovered.current && hovered.current !== el) hovered.current.classList.remove('lp-locate-hover')
      hovered.current = el
      if (!el) return setTip(null)
      el.classList.add('lp-locate-hover')
      setTip({ x: e.clientX + 12, y: e.clientY + 16, text: el.dataset.locateLabel || el.dataset.locate || '' })
    }
    const onClick = async (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-locate]')
      if (!el) return
      e.preventDefault()
      e.stopPropagation()
      const [doc, path] = (el.dataset.locate as string).split('#') as [DocKey, string]
      // 没有编辑权限的账号不能从前台跳到后台（业务方 2026-10-20 确认）
      // 只记住明确的结果；登录过期、断网下次点击时重新查询
      const check = editable.current.get(doc) ?? (await fetchCanEdit(doc))
      if (check === 'yes' || check === 'no') editable.current.set(doc, check)
      if (check !== 'yes') {
        window.alert(EDIT_CHECK_TEXT[check])
        return
      }
      if (inFrame) window.parent.postMessage({ source: LOCATE_SOURCE, action: 'focus-field', doc, path }, window.location.origin)
      else window.open(`${adminUrl(doc)}?locate=${encodeURIComponent(path)}`, '_blank', 'noopener')
    }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('click', onClick, true)
    }
  }, [locating, inFrame])

  return (
    <>
      <RefreshRouteOnSave refresh={refresh} serverURL={serverURL} apiRoute="/api/cms" />
      <button type="button" className="lp-locate-toggle" aria-pressed={locating} onClick={() => setLocating((v) => !v)}>
        {locating ? '退出定位模式' : '定位模式'}
      </button>
      {locating && tip ? (
        <div className="lp-locate-tip" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </div>
      ) : null}
    </>
  )
}
