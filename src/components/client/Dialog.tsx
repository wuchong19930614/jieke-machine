'use client'
// 原生 dialog：打开时锁定底层页面、焦点限制在弹窗内，支持 Esc 关闭（技术方案 4.2）
import React, { useEffect, useRef } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  className?: string
  labelledBy?: string
  label?: string
  closeLabel?: string
  hideCloseButton?: boolean
  // 预览里定位到弹窗内的字段时，先打开弹窗
  onReveal?: () => void
  children: React.ReactNode
}

// 点击遮罩关闭：按下和松开都在弹窗框外才算，在输入框里拖选文字后在框外松开不会关闭。
// 遮罩属于 dialog 元素本身，所以要按坐标判断是否在框外：点到弹窗内边距时目标也是 dialog
export function useBackdropClose(ref: React.RefObject<HTMLDialogElement | null>, onClose: () => void) {
  const pressedOnBackdrop = useRef(false)
  const onBackdrop = (e: React.MouseEvent) => {
    const dialog = ref.current
    if (!dialog || e.target !== dialog) return false
    const rect = dialog.getBoundingClientRect()
    return e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom
  }
  return {
    onMouseDown: (e: React.MouseEvent) => {
      pressedOnBackdrop.current = onBackdrop(e)
    },
    onClick: (e: React.MouseEvent) => {
      if (pressedOnBackdrop.current && onBackdrop(e)) onClose()
      pressedOnBackdrop.current = false
    },
  }
}

export function Dialog({ open, onClose, className, labelledBy, label, closeLabel = 'Close', hideCloseButton, onReveal, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const backdrop = useBackdropClose(ref, onClose)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    const onRevealEvent = () => onReveal?.()
    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('jieke:reveal', onRevealEvent)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      dialog.removeEventListener('jieke:reveal', onRevealEvent)
    }
  }, [onClose, onReveal])

  return (
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      {...backdrop}
    >
      {hideCloseButton ? null : (
        <button type="button" className="lp-dialog-close" aria-label={closeLabel} onClick={onClose}>
          ×
        </button>
      )}
      {/* 关闭时内容仍保留在页面里（不显示），方便预览里定位到弹窗内的字段 */}
      {children}
    </dialog>
  )
}
