'use client'
// 联系页表单：从 Banner 的 “Get a Quote” 进入时（?product=网址短名），自动把该产品填进 Product / Model（技术方案 4.3 第 6 条）
import { useSearchParams } from 'next/navigation'
import React from 'react'

import { InquiryForm } from './InquiryForm'

type Props = Omit<React.ComponentProps<typeof InquiryForm>, 'source' | 'defaultProductModel'> & { productNames: Record<string, string> }

export function ContactForm({ productNames, ...rest }: Props) {
  const params = useSearchParams()
  const slug = params.get('product')
  const name = slug ? productNames[slug] : undefined
  return <InquiryForm source="contact_page" defaultProductModel={name} {...rest} />
}
