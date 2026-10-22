// 日志里不记录客户资料（技术方案 9.1）
// 数据库报错的信息里带着整条 SQL 的参数（姓名、邮箱、电话、需求原文），写日志前只留错误类型和不含参数的第一行

type ErrorLike = { name?: unknown; message?: unknown; cause?: unknown }

const firstLine = (value: unknown): string =>
  (typeof value === 'string' ? value : String(value))
    .split(/\n\s*params:/i)[0]
    .split('\n')[0]
    .slice(0, 300)

export function safeError(error: unknown): { name: string; message: string; cause?: string } {
  const e = (error && typeof error === 'object' ? error : { message: error }) as ErrorLike
  const cause = e.cause && typeof e.cause === 'object' ? (e.cause as ErrorLike) : null
  return {
    name: typeof e.name === 'string' ? e.name : 'Error',
    message: firstLine(e.message ?? ''),
    ...(cause ? { cause: firstLine(cause.message ?? '') } : {}),
  }
}

// 邮箱只留首字母和域名，如 j***@example.com
export const maskEmail = (email: string): string => email.replace(/^([^@])[^@]*(@.+)$/, '$1***$2')
