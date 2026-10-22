'use client'
// 前台弹层状态：联系弹窗、邮箱/电话弹层、红色客服窗口、蓝色在线沟通、Cookie 设置
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Overlay = 'contact' | 'email' | 'phone' | 'chat' | 'blue' | 'cookie' | null

type UiContextValue = {
  overlay: Overlay
  open: (overlay: Exclude<Overlay, null>, trigger?: HTMLElement | null) => void
  close: () => void
  toast: (message: string) => void
  // 当前所在的产品详情页的产品名，WhatsApp 预填消息用（技术方案 4.5）；其他页面为空
  productName: string | null
  setProductName: (name: string | null) => void
}

const UiContext = createContext<UiContextValue | null>(null)

export function useUi(): UiContextValue {
  const value = useContext(UiContext)
  if (!value) throw new Error('useUi 必须在 UiProvider 内使用')
  return value
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [productName, setProductName] = useState<string | null>(null)

  const open = useCallback((next: Exclude<Overlay, null>, from?: HTMLElement | null) => {
    setTrigger(from ?? (document.activeElement as HTMLElement | null))
    setOverlay(next)
  }, [])

  // 关闭后焦点回到触发按钮（技术方案 4.2）
  const close = useCallback(() => {
    setOverlay(null)
    window.setTimeout(() => trigger?.focus?.(), 0)
  }, [trigger])

  const toast = useCallback((message: string) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(null), 3000)
  }, [])

  // 手机上输入框获得焦点时临时隐藏悬浮栏和底部按钮条，避免遮挡提交按钮（技术方案 4.6）
  useEffect(() => {
    const isMobile = () => window.matchMedia('(max-width: 767px)').matches
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null
      if (isMobile() && el?.matches('input:not([type=checkbox]):not([type=radio]), textarea, select')) document.body.classList.add('lp-typing')
    }
    const onFocusOut = () => document.body.classList.remove('lp-typing')
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  const value = useMemo(() => ({ overlay, open, close, toast, productName, setProductName }), [overlay, open, close, toast, productName])

  return (
    <UiContext.Provider value={value}>
      {children}
      {toastMessage ? (
        <div className="lp-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </UiContext.Provider>
  )
}

// 页面里任意位置打开弹层的按钮（服务端组件里用）
export function OpenOverlayButton({
  overlay,
  className,
  children,
  ...rest
}: { overlay: Exclude<Overlay, null>; className?: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open } = useUi()
  return (
    <button type="button" className={className} {...rest} onClick={(e) => open(overlay, e.currentTarget)}>
      {children}
    </button>
  )
}
