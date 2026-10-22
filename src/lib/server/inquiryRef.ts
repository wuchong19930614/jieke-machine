// 询盘编号：INQ-年月日-当天序号（技术方案 6.1），不含个人信息
import type { Payload } from 'payload'

// 序号取当天已有的最大编号 + 1。按当天条数计算时，删掉当天任一询盘后算出的编号会与已有编号重复
export async function nextInquiryRef(payload: Payload, now = new Date()): Promise<string> {
  const prefix = `INQ-${now.toISOString().slice(0, 10).replace(/-/g, '')}-`
  const { docs } = await payload.find({
    collection: 'inquiries',
    where: { inquiryRef: { like: prefix } },
    sort: '-inquiryRef',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    select: { inquiryRef: true },
  })
  const last = Number(docs[0]?.inquiryRef?.slice(prefix.length, prefix.length + 4))
  return `${prefix}${String((Number.isInteger(last) ? last : 0) + 1).padStart(4, '0')}`
}

// 唯一约束冲突的字段：Payload 把数据库的唯一约束错误转成 ValidationError，errors[].path 为字段名
export function uniqueConflictField(error: unknown): string | null {
  if ((error as { name?: string } | null)?.name !== 'ValidationError') return null
  const errors = (error as { data?: { errors?: { path?: unknown }[] } }).data?.errors ?? []
  return errors.map((e) => e.path).find((path): path is string => typeof path === 'string') ?? null
}
