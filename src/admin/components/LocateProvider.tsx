'use client'
// 后台的前台定位（技术方案 5.3 第 6 点）
// 1. 后台→前台：聚焦任一字段时旁边出现“在前台定位”按钮，点击后通知实时预览滚动到对应元素
// 2. 前台→后台：预览里点选元素后，后台跳到对应记录，自动展开折叠的分组和列表行，并高亮该字段
import { toast, useConfig } from '@payloadcms/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ClientField } from 'payload'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  adminUrl,
  type DocKey,
  fieldDomKey,
  HOME_PREVIEW_REVEAL_EVENT,
  isLocateMessage,
  LOCATE_SOURCE,
  pathFromDomKey,
} from '@/lib/locate'

function docFromPathname(pathname: string): DocKey | null {
  const collection = pathname.match(/^\/admin\/collections\/([^/]+)\/([^/]+)/)
  if (collection && collection[2] !== 'create') return `${collection[1]}:${decodeURIComponent(collection[2])}`
  const global = pathname.match(/^\/admin\/globals\/([^/]+)/)
  if (global) return `global:${global[1]}`
  return null
}

function findField(path: string): HTMLElement | null {
  const key = fieldDomKey(path)
  return (
    document.getElementById(`field-${key}`) ??
    document.querySelector<HTMLElement>(`.field-${CSS.escape(key)}`) ??
    // 富文本（Lexical）字段没有 id，只有标签的 for 指向字段路径
    document.querySelector<HTMLElement>(`label[for="field-${CSS.escape(key)}"]`)?.closest<HTMLElement>('.field-type') ??
    document.querySelector<HTMLElement>(`[id^="field-${CSS.escape(key)}"]`)
  )
}

// Payload 后台的字段是懒渲染的：只渲染视口附近和已经滚过去的字段，折叠分组里的字段在展开前不在页面上。
// 所以先按字段配置算出目标字段外层的折叠分组和数组行（DOM id 规则同 Payload 的 getFieldPaths / ArrayRow），
// 再从外到内逐层展开并滚动到视口里，等字段渲染出来
type Container = { kind: 'field' | 'collapsible' | 'row'; id: string }

function containersFor(fields: ClientField[], segments: string[], parentPath = '', parentIndexPath = ''): Container[] | null {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    if ('name' in field && field.name) {
      if (field.name !== segments[0]) continue
      const path = parentPath ? `${parentPath}.${field.name}` : field.name
      const rest = segments.slice(1)
      if (!rest.length) return []
      const self: Container = { kind: 'field', id: `field-${fieldDomKey(path)}` }
      if (field.type === 'group') {
        const inner = containersFor(field.fields, rest, path)
        return inner ? [self, ...inner] : null
      }
      if (field.type === 'array') {
        const inner = containersFor(field.fields, rest.slice(1), `${path}.${rest[0]}`)
        return inner ? [self, { kind: 'row', id: `${path.split('.').join('-')}-row-${rest[0]}` }, ...inner] : null
      }
      // 富文本、JSON 等字段内部的路径定位到字段本身
      return []
    }
    if (field.type !== 'collapsible' && field.type !== 'row') continue
    const indexPath = parentIndexPath ? `${parentIndexPath}-${i}` : String(i)
    const inner = containersFor(field.fields, segments, parentPath, indexPath)
    if (!inner) continue
    if (field.type === 'row') return inner
    const unnamed = `${parentPath ? `${parentPath}.` : ''}_index-${indexPath}`
    return [{ kind: 'collapsible', id: `field-collapsible-${fieldDomKey(unnamed)}` }, ...inner]
  }
  return null
}

// 有的字段在后台换了显示位置（产品详情的模块标题输入框放在各模块分组里，见 Products.ts 的 moduleTitles）：
// 那里的 ui 字段在 admin.custom.locateAliases 里声明了它代为显示的字段路径，按它所在的分组展开
function aliasTarget(fields: ClientField[], path: string): string | null {
  for (const field of fields) {
    const aliases = (field.admin as { custom?: { locateAliases?: string[] } } | undefined)?.custom?.locateAliases
    if (field.type === 'ui' && aliases?.includes(path)) return field.name
    if (field.type === 'collapsible' || field.type === 'row') {
      const found = aliasTarget(field.fields, path)
      if (found) return found
    }
  }
  return null
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 在外层容器范围内逐屏往下滚，让懒渲染的内容进入视口。每次都按容器当前的位置计算：
// 上方的字段渲染出来后高度会变，只滚一次的话容器会被挤出视口，里面的字段就一直不渲染
function scrollWithin(container: HTMLElement | null, step: number) {
  if (!container) {
    window.scrollBy({ top: window.innerHeight * 0.8 })
    return
  }
  const rect = container.getBoundingClientRect()
  const span = Math.max(0, rect.height - window.innerHeight * 0.5)
  const offset = span ? (step * window.innerHeight * 0.8) % (span + 1) : 0
  window.scrollTo({ top: rect.top + window.scrollY + offset })
}

// 等元素渲染出来；一直没有时在外层容器里往下滚（最多约 6 秒）
async function findById(id: string, within: HTMLElement | null): Promise<HTMLElement | null> {
  for (let i = 0; i < 40; i++) {
    const el = document.getElementById(id)
    if (el) return el
    if (i >= 3) scrollWithin(within, i - 3)
    await wait(150)
  }
  return null
}

async function openContainer(container: Container, within: HTMLElement | null): Promise<HTMLElement | null> {
  const el = await findById(container.id, within)
  if (!el) return null
  if (container.kind === 'field') {
    el.scrollIntoView({ block: 'start' })
    await wait(200)
    return el
  }
  const box = el.classList.contains('collapsible')
    ? el
    : (el.querySelector<HTMLElement>(':scope > .collapsible') ?? el.closest<HTMLElement>('.collapsible'))
  if (box?.classList.contains('collapsible--collapsed')) {
    box.querySelector<HTMLButtonElement>(':scope > .collapsible__toggle-wrap .collapsible__toggle')?.click()
    await wait(260)
  }
  ;(box ?? el).scrollIntoView({ block: 'start' })
  await wait(120)
  return box ?? el
}

// 字段已渲染但外层仍折叠时（例如用户手动收起过），从外到内依次展开
async function expandAncestors(element: HTMLElement): Promise<void> {
  const collapsed: HTMLElement[] = []
  let node = element.parentElement
  while (node) {
    if (node.classList.contains('collapsible--collapsed')) collapsed.unshift(node)
    node = node.parentElement
  }
  for (const box of collapsed) {
    box.querySelector<HTMLButtonElement>(':scope > .collapsible__toggle-wrap .collapsible__toggle')?.click()
    await wait(260)
  }
}

// 从其他页面跳转过来时表单可能还在加载，最多等 10 秒
async function waitForForm(): Promise<void> {
  for (let i = 0; i < 50; i++) {
    if (document.querySelector('.document-fields .render-fields')) return wait(300).then(() => undefined)
    await wait(200)
  }
}

async function focusField(path: string, fields: ClientField[] | undefined): Promise<boolean> {
  await waitForForm()
  let element = findField(path)
  // 最内层已打开的容器（分组、数组行）
  let within: HTMLElement | null = null
  if (!element && fields) {
    const target = aliasTarget(fields, path) ?? path
    for (const container of containersFor(fields, target.split('.')) ?? []) within = (await openContainer(container, within)) ?? within
  }
  // 分组内容靠滚动进视口触发渲染，较慢的电脑上可能要等一会，最多等 6 秒
  for (let i = 0; i < 30 && !element; i++) {
    element = findField(path)
    if (!element) {
      if (within) scrollWithin(within, i)
      await wait(200)
    }
  }
  if (!element) return false
  await expandAncestors(element)
  const wrapper = (element.closest('.field-type') as HTMLElement | null) ?? element
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' })
  wrapper.classList.add('jk-locate-flash')
  window.setTimeout(() => wrapper.classList.remove('jk-locate-flash'), 2400)
  const focusable = element.matches('input, textarea, select, button')
    ? element
    : element.querySelector<HTMLElement>('input, textarea, select, [contenteditable="true"]')
  focusable?.focus({ preventScroll: true })
  return true
}

// 由当前获得焦点的元素推算字段路径
function pathFromElement(target: Element | null): string | null {
  let node: Element | null = target
  while (node && node !== document.body) {
    const id = node.id
    // “隐藏”勾选（名称Hidden）和“文字样式”（名称Style）本身在前台没有元素，定位到它对应的文字
    if (id && id.startsWith('field-') && !id.startsWith('field-type')) return pathFromDomKey(id.slice(6)).replace(/(Hidden|Style)$/, '')
    // 富文本（Lexical）字段：从字段标签的 for 读路径
    if (node.classList.contains('rich-text-lexical')) {
      const target = node.querySelector('label.field-label')?.getAttribute('for')
      if (target?.startsWith('field-')) return pathFromDomKey(target.slice(6))
    }
    node = node.parentElement
  }
  return null
}

// 实时预览窗口里的 iframe（Payload 3.91 的类名是 iframe-loader__iframe，按外层容器查找，不依赖内部类名）
function previewFrame(): HTMLIFrameElement | null {
  return document.querySelector<HTMLIFrameElement>('.live-preview-window iframe')
}

export function LocateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [button, setButton] = useState<{ top: number; left: number; path: string } | null>(null)
  const hideTimer = useRef<number | null>(null)
  const currentDoc = docFromPathname(pathname)
  const { getEntityConfig } = useConfig()
  const [kind, ref] = currentDoc?.split(':') ?? []
  const fields = !currentDoc ? undefined : kind === 'global' ? getEntityConfig({ globalSlug: ref })?.fields : getEntityConfig({ collectionSlug: kind })?.fields

  // 带 ?locate= 打开编辑页时（例如从预览里点选跳转过来），自动定位到字段
  const locateParam = searchParams.get('locate')
  useEffect(() => {
    if (!locateParam || !currentDoc) return
    void focusField(locateParam, fields).then((found) => {
      if (!found) toast.warning('没有找到这个字段，可能它所在的模块被隐藏了')
    })
  }, [locateParam, currentDoc, fields])

  // 前台→后台：接收预览页发来的点选消息
  const onMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isLocateMessage(event.data)) return
      const message = event.data
      if (message.action === 'reveal-result') {
        if (!message.found) toast.warning('当前预览页面里没有这个字段，可能模块已隐藏、内容为空，或不在这个页面')
        return
      }
      if (message.action !== 'focus-field') return
      if (message.doc === currentDoc) {
        void focusField(message.path, fields).then((found) => {
          if (!found) toast.warning('没有找到这个字段')
        })
        return
      }
      if (window.confirm('这个内容属于另一条记录，要前往编辑吗？当前页面未保存的修改会丢失。')) {
        router.push(`${adminUrl(message.doc)}?locate=${encodeURIComponent(message.path)}`)
      }
    },
    [currentDoc, fields, router],
  )

  useEffect(() => {
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [onMessage])

  // 后台→前台：字段获得焦点时显示“在前台定位”按钮
  useEffect(() => {
    if (!currentDoc) return
    let anchor: { element: HTMLElement; path: string } | null = null
    const place = () => {
      if (!anchor) return
      const rect = anchor.element.getBoundingClientRect()
      // 字段滚出视野后隐藏按钮
      if (rect.bottom < 0 || rect.top > window.innerHeight) return setButton(null)
      setButton({ top: Math.max(8, rect.top - 30), left: Math.max(8, rect.right - 120), path: anchor.path })
    }
    const onFocus = (event: FocusEvent) => {
      const target = event.target as Element | null
      if (!target || target.closest('.jk-locate-button')) return
      // 焦点进了媒体选择、关联选择这类抽屉或弹窗，或者离开了编辑区：立即隐藏，不压在抽屉上面
      if (target.closest('.payload__modal-item, [role="dialog"]') || !target.closest('.document-fields, .render-fields')) {
        if (hideTimer.current) window.clearTimeout(hideTimer.current)
        anchor = null
        setButton(null)
        return
      }
      const path = pathFromElement(target)
      if (!path) return
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
      anchor = { element: (target.closest('.field-type') as HTMLElement | null) ?? (target as HTMLElement), path }
      place()
    }
    const onBlur = () => {
      hideTimer.current = window.setTimeout(() => {
        anchor = null
        setButton(null)
      }, 4000)
    }
    // 浏览器把聚焦的字段自动滚入视野时，按钮跟着字段移动
    const onScroll = () => place()
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [currentDoc])

  const reveal = () => {
    if (!button || !currentDoc) return
    if (currentDoc === 'global:home-page' && !window.dispatchEvent(new CustomEvent(HOME_PREVIEW_REVEAL_EVENT, {
      cancelable: true,
      detail: button.path,
    }))) return
    const frame = previewFrame()
    if (!frame?.contentWindow) {
      toast.info('请先点击右上角的“实时预览”打开预览，再点“在前台定位”')
      return
    }
    frame.contentWindow.postMessage({ source: LOCATE_SOURCE, action: 'reveal', doc: currentDoc, path: button.path }, window.location.origin)
  }

  return (
    <>
      {children}
      {button && currentDoc ? (
        <button
          type="button"
          className="jk-locate-button"
          style={{ top: button.top, left: button.left }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={reveal}
        >
          在前台定位
        </button>
      ) : null}
    </>
  )
}
