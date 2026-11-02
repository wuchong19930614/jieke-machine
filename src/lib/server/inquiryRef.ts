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

// 唯一约束冲突的字段：Payload 把数据库的唯一约束错误转成 ValidationError，errors[].path 为字段名；
// 兼容远程库直接抛出 UNIQUE constraint failed: inquiries.<列名> 的情况
const COLUMN_TO_FIELD: Record<string, string> = {
  inquiry_ref: 'inquiryRef',
  submission_id: 'submissionId',
}

export function uniqueConflictField(error: unknown): string | null {
  if ((error as { name?: string } | null)?.name === 'ValidationError') {
    const errors = (error as { data?: { errors?: { path?: unknown }[] } }).data?.errors ?? []
    return errors.map((e) => e.path).find((path): path is string => typeof path === 'string') ?? null
  }
  let current: unknown = error
  for (let depth = 0; current && depth < 4; depth++) {
    const msg = String((current as { message?: unknown }).message ?? '')
    const match = msg.match(/UNIQUE constraint failed:\s*inquiries\.([a-z_]+)/i)
    if (match?.[1]) return COLUMN_TO_FIELD[match[1]] ?? match[1]
    current = (current as { cause?: unknown }).cause
  }
  return null
}
