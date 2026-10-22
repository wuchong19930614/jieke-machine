// 自定义接口和服务端操作的后台登录校验：必须登录、角色符合，并且本次会话已通过双重验证
// payload-totp 只包装集合和全局配置的权限，自定义接口要自己检查（技术方案 3.8 第 3 点）
import type { Payload } from 'payload'

import type { Role } from './constants'

export type StaffUser = {
  id: number | string
  email: string
  role?: Role
  collection?: string
  _strategy?: string
  hasTotp?: boolean
}

export type StaffCheck = { ok: true; user: StaffUser } | { ok: false; status: 401 | 403; code: 'UNAUTHORIZED' | 'FORBIDDEN' }

export async function checkStaff(payload: Payload, headers: Headers, roles: Role[]): Promise<StaffCheck> {
  const { user } = await payload.auth({ headers })
  const staff = user as StaffUser | null
  if (!staff || staff.collection !== 'users') return { ok: false, status: 401, code: 'UNAUTHORIZED' }
  const totpDisabled = Boolean(
    (payload.config.custom as { totp?: { pluginOptions?: { disabled?: boolean } } } | undefined)?.totp?.pluginOptions?.disabled,
  )
  // 通过验证码验证的会话 _strategy 为 totp；API Key 不适用双重验证
  const verified = totpDisabled || staff._strategy === 'totp' || staff._strategy === 'api-key'
  if (!verified) return { ok: false, status: 401, code: 'UNAUTHORIZED' }
  if (!staff.role || !roles.includes(staff.role)) return { ok: false, status: 403, code: 'FORBIDDEN' }
  return { ok: true, user: staff }
}
