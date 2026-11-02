// 后台操作碰到意料之外的错误时，Payload 只回一句英文 “Something went wrong.”，原因只写进日志。
// 这里把常见原因换成中文说明，并附上错误编号（线上是 Vercel 的请求编号），开发人员按编号到日志里查
import { type AfterErrorHook, type Field, ValidationError } from 'payload'

import { labelForPath } from '@/lib/fieldWalk'

const GENERIC = 'Something went wrong.'

// Payload 登录集合和重定向插件自带的字段不在自定义 fields 里（或 label 是多语言函数），在这里兜底
const BUILTIN_FIELD_LABELS: Record<string, string> = {
  email: '邮箱',
  password: '密码',
  from: '原网址路径',
}

// 把错误和它的 cause 拼在一起判断：数据库报错包在 Drizzle 的 “Failed query” 里面
function errorText(error: unknown): string {
  const parts: string[] = []
  let current: unknown = error
  for (let depth = 0; current && depth < 4; depth++) {
    const e = current as { name?: unknown; code?: unknown; message?: unknown; cause?: unknown }
    parts.push(String(e.name ?? ''), String(e.code ?? ''), String(e.message ?? ''))
    current = e.cause
  }
  return parts.join(' ')
}

export function explainServerError(error: unknown, errorId: string): string {
  const text = errorText(error)
  const ref = `（错误编号 ${errorId}）`
  if (/no such (column|table)|has no column named/i.test(text)) return `数据库结构和当前程序版本不一致，需要开发人员执行数据库迁移后才能继续操作。${ref}`
  if (/UNIQUE constraint failed/i.test(text)) return `某个要求唯一的值（如网址短名或邮箱）已被其他记录使用，请换一个后再保存。${ref}`
  if (/quota|blocked|limit exceeded|exceeded .*limit/i.test(text) && /libsql|sqlite|turso|hrana|database/i.test(text))
    return `数据库暂时不能写入：可能超出了 Turso 免费额度或被暂停，请联系开发人员检查 Turso 控制台。${ref}`
  if (/SQLITE_BUSY|database is locked/i.test(text)) return `数据库正忙，请等几秒再试一次。${ref}`
  if (/vercel ?blob|BlobAccessError|BlobStoreNotFound|BlobStoreSuspended/i.test(text))
    return `图片存储连接失败：存储令牌可能失效或存储被停用，请联系开发人员检查 Vercel Blob 设置。${ref}`
  if (/ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|fetch failed|timed? ?out/i.test(text)) return `连接外部服务失败或超时，请稍后重试。${ref}`
  return `服务器出错，请稍后重试。如果一直出现，请把错误编号 ${errorId} 发给开发人员。`
}

// 只替换被 Payload 隐藏成通用英文的错误；已经有具体说明的（校验失败、权限不足等）原样返回
export const explainUnexpectedError: AfterErrorHook = ({ error, req, result }) => {
  if (result?.errors?.[0]?.message !== GENERIC) return
  const errorId = req.headers?.get('x-vercel-id') || new Date().toISOString()
  return { response: { ...result, errors: [{ message: explainServerError(error, errorId) }] } }
}

// 数据库唯一约束等报错只带字段路径（如 slug），右下角会显示英文键名：按路径换成后台的中文字段名
export const labelValidationFields: AfterErrorHook = ({ error, req, result }) => {
  if (!(error instanceof ValidationError) || !result?.errors?.[0]) return
  const data = error.data as { collection?: string; global?: string; errors?: { path: string; label?: unknown }[] }
  if (!data.errors?.length || data.errors.every((e) => typeof e.label === 'string')) return
  const fields: Field[] | undefined = data.collection
    ? req.payload.config.collections.find((c) => c.slug === data.collection)?.fields
    : req.payload.config.globals.find((g) => g.slug === data.global)?.fields
  if (!fields) return
  const labels = data.errors.map((e) =>
    typeof e.label === 'string' ? e.label : (labelForPath(fields, e.path) ?? BUILTIN_FIELD_LABELS[e.path] ?? e.path),
  )
  const message = `${req.t('error:followingFieldsInvalid', { count: labels.length })} ${labels.join(', ')}`
  return { response: { ...result, errors: [{ ...result.errors[0], message }] } }
}
