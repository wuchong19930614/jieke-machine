// 询盘字段校验：浏览器和服务端共用同一套规则（技术方案 4.5 第 4 条、6.1）
// 错误用“表单文案”里的键表示，显示时再换成后台可改的英文提示
import { z } from 'zod'

import type { FORM_TEXTS } from '@/content/texts'

import { INQUIRY_SOURCES, type InquirySource } from './constants'
import { isCountryCode } from './countries'

export type FormTextKey = keyof typeof FORM_TEXTS
export type InquiryField = 'name' | 'email' | 'country' | 'phone' | 'company' | 'productModel' | 'requirements'

export const LIMITS = { name: 100, email: 200, phone: 30, company: 150, productModel: 150, requirements: 5000 } as const

const optionalText = (max: number, tooLong: FormTextKey) =>
  z
    .string()
    .trim()
    .max(max, { message: tooLong })
    .optional()
    .transform((v) => (v ? v : undefined))

const base = z.object({
  source: z.enum(INQUIRY_SOURCES.map((s) => s.value) as [InquirySource, ...InquirySource[]]),
  name: z
    .string({ message: 'errNameRequired' })
    .trim()
    .min(1, { message: 'errNameRequired' })
    .max(LIMITS.name, { message: 'errNameTooLong' }),
  email: z
    .string({ message: 'errEmailRequired' })
    .trim()
    .min(1, { message: 'errEmailRequired' })
    .max(LIMITS.email, { message: 'errEmailInvalid' })
    .email({ message: 'errEmailInvalid' }),
  country: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  phone: optionalText(LIMITS.phone, 'errPhoneTooLong'),
  company: optionalText(LIMITS.company, 'errCompanyTooLong'),
  productModel: optionalText(LIMITS.productModel, 'errProductTooLong'),
  requirements: z
    .string({ message: 'errRequirementsRequired' })
    .trim()
    .min(1, { message: 'errRequirementsRequired' })
    .max(LIMITS.requirements, { message: 'errRequirementsTooLong' }),
})

// 离线留言的国家选填（Q11），其他表单必填（Q12）
export const inquirySchema = base.superRefine((value, ctx) => {
  if (value.country && !isCountryCode(value.country)) {
    ctx.addIssue({ code: 'custom', path: ['country'], message: 'errCountryRequired' })
  }
  if (!value.country && value.source !== 'offline_message') {
    ctx.addIssue({ code: 'custom', path: ['country'], message: 'errCountryRequired' })
  }
})

export type InquiryInput = z.input<typeof inquirySchema>
export type InquiryData = z.output<typeof inquirySchema>

export type ValidationResult =
  | { ok: true; data: InquiryData }
  | { ok: false; errors: Partial<Record<InquiryField, FormTextKey>> }

export function validateInquiry(input: unknown): ValidationResult {
  const result = inquirySchema.safeParse(input)
  if (result.success) return { ok: true, data: result.data }
  const errors: Partial<Record<InquiryField, FormTextKey>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as InquiryField | 'source'
    if (field === 'source') continue
    if (!errors[field]) errors[field] = issue.message as FormTextKey
  }
  return { ok: false, errors }
}

// 需求里超过 3 个网址的标为“网址过多”（技术方案 4.5）
export function countLinks(text: string): number {
  return (text.match(/(?:https?:\/\/|www\.)[^\s]+/gi) ?? []).length
}
