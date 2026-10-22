// 角色权限（技术方案 3.8）。双重验证由 payload-totp 在外层统一包装，这里只判断角色
import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

import type { Role } from '@/lib/constants'

type StaffUser = {
  id: number | string
  collection?: string
  role?: Role | null
  editScope?: {
    limited?: boolean | null
    globals?: string[] | null
    products?: (number | string | { id: number | string })[] | null
    cases?: (number | string | { id: number | string })[] | null
  } | null
}

export function getStaff(req: PayloadRequest): StaffUser | null {
  const user = req.user as StaffUser | null
  if (!user || user.collection !== 'users') return null
  return user
}

export function hasRole(req: PayloadRequest, ...roles: Role[]): boolean {
  const user = getStaff(req)
  return Boolean(user?.role && roles.includes(user.role))
}

export const isLoggedIn: Access = ({ req }) => Boolean(getStaff(req))
export const isAdmin: Access = ({ req }) => hasRole(req, 'admin')
export const isAdminOrDeveloper: Access = ({ req }) => hasRole(req, 'admin', 'developer')
export const isAdminOrSales: Access = ({ req }) => hasRole(req, 'admin', 'sales')
export const isContentRole: Access = ({ req }) => hasRole(req, 'admin', 'editor', 'developer')
export const denyAll: Access = () => false

export const adminFieldOnly: FieldAccess = ({ req }) => hasRole(req, 'admin')

const toIds = (list: unknown): (number | string)[] =>
  (Array.isArray(list) ? list : []).map((item) =>
    typeof item === 'object' && item ? (item as { id: number | string }).id : (item as number | string),
  )

function isLimitedEditor(user: StaffUser | null): boolean {
  return Boolean(user?.role === 'editor' && user.editScope?.limited)
}

// 产品、案例：受限编辑只能改授权的记录，不能新建和删除
export function recordEditAccess(kind: 'products' | 'cases'): Access {
  return ({ req }) => {
    const user = getStaff(req)
    if (!user?.role || !['admin', 'editor', 'developer'].includes(user.role)) return false
    if (!isLimitedEditor(user)) return true
    const ids = toIds(kind === 'products' ? user.editScope?.products : user.editScope?.cases)
    if (!ids.length) return false
    return { id: { in: ids } } as Where
  }
}

export function recordCreateDeleteAccess(): Access {
  return ({ req }) => {
    const user = getStaff(req)
    if (!user?.role || !['admin', 'editor', 'developer'].includes(user.role)) return false
    return !isLimitedEditor(user)
  }
}

// 全局配置：受限编辑只能改勾选过的配置
export function globalEditAccess(slug: string): Access {
  return ({ req }) => {
    const user = getStaff(req)
    if (!user?.role || !['admin', 'editor', 'developer'].includes(user.role)) return false
    if (!isLimitedEditor(user)) return true
    return Boolean(user.editScope?.globals?.includes(slug))
  }
}

// 辅助页面集合按“全局配置”对待，受限编辑勾选 pages 后可改
export const pagesEditAccess: Access = (args) => globalEditAccess('pages')(args)
