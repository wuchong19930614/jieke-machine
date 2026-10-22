'use client'
// 全站 WhatsApp 链接（技术方案 4.5）：在产品详情页时预填消息带上产品名，其他页面用通用消息；只含网站文案和产品名
import React, { useEffect } from 'react'

import { fill } from '@/content/defineTexts'
import { whatsappLink } from '@/lib/whatsapp'

import { useUi } from './UiProvider'

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  number: string
  message: string
  // 产品页的预填消息模板，含 {productName}
  productMessage: string
}

export function WhatsAppLink({ number, message, productMessage, children, ...rest }: Props) {
  const { productName } = useUi()
  const text = productName ? fill(productMessage, { productName }) || message : message
  return (
    <a href={whatsappLink(number, text)} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}

// 产品详情页放一个，告诉全站的 WhatsApp 链接当前是哪个产品；离开页面时清掉
export function CurrentProduct({ name }: { name: string }) {
  const { setProductName } = useUi()
  useEffect(() => {
    setProductName(name)
    return () => setProductName(null)
  }, [name, setProductName])
  return null
}
