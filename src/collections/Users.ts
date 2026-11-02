// 后台用户与角色（技术方案 3.8）；双重验证字段由 payload-totp 插件添加
import { ValidationError } from 'payload'
import type { CollectionConfig } from 'payload'

import { adminFieldOnly, getStaff, hasRole, isAdmin } from '@/access'
import { ROLES } from '@/lib/constants'
import { restoreSessionStrategy } from '@/lib/server/pluginSession'

const MIN_PASSWORD = 12

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: '用户', plural: '用户' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'updatedAt'],
    group: '系统',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    // 管理员管理全部用户；其他人只能看到和修改自己的资料
    read: ({ req }) => (hasRole(req, 'admin') ? true : getStaff(req) ? { id: { equals: getStaff(req)!.id } } : false),
    create: isAdmin,
    update: ({ req }) => (hasRole(req, 'admin') ? true : getStaff(req) ? { id: { equals: getStaff(req)!.id } } : false),
    delete: isAdmin,
    // payload-totp 文档要求：只有管理员能为他人解除锁定
    unlock: isAdmin,
    admin: ({ req }) => Boolean(getStaff(req)),
  },
  hooks: {
    // 导入导出插件重新查当前用户时补回会话的双重验证标记（见 lib/server/pluginSession.ts）
    afterRead: [restoreSessionStrategy],
    beforeChange: [
      // 系统里还没有用户时，第一个账号自动设为管理员（创建首个用户时还没人能分配角色）
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
        if (totalDocs === 0) return { ...data, role: 'admin' }
        return data
      },
    ],
    // 密码长度在操作开始前检查：“忘记密码”重置时 Payload 不把新密码传给 beforeValidate，只按内置的 3 位下限校验
    beforeOperation: [
      ({ args, operation, req }) => {
        if (operation !== 'create' && operation !== 'update' && operation !== 'resetPassword') return args
        const password = (args as { data?: { password?: unknown } }).data?.password
        if (typeof password === 'string' && password.length > 0 && password.length < MIN_PASSWORD) {
          throw new ValidationError(
            {
              collection: 'users',
              errors: [{ label: '密码', path: 'password', message: `密码至少 ${MIN_PASSWORD} 位` }],
            },
            req?.t,
          )
        }
        return args
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: '姓名' },
    {
      name: 'role',
      type: 'select',
      label: '角色',
      required: true,
      defaultValue: 'editor',
      options: [...ROLES],
      saveToJWT: true,
      access: { create: adminFieldOnly, update: adminFieldOnly },
      admin: {
        position: 'sidebar',
        description: '管理员：全部权限；内容编辑：页面、产品、案例和媒体；业务人员：询盘和只读内容；开发协作：内容、设置和备份记录，看不到询盘',
      },
    },
    {
      name: 'editScope',
      type: 'group',
      label: '可编辑范围',
      access: { create: adminFieldOnly, update: adminFieldOnly },
      admin: {
        condition: (data) => data?.role === 'editor',
        description: '只对“内容编辑”生效。勾选“限定范围”后，该账号只能修改下面勾选的内容，且不能新建或删除产品和案例。',
      },
      fields: [
        { name: 'limited', type: 'checkbox', label: '限定范围', defaultValue: false },
        {
          name: 'globals',
          type: 'select',
          hasMany: true,
          label: '可编辑的页面配置和设置',
          options: [
            { label: '全站设置', value: 'site-settings' },
            { label: '主题', value: 'theme' },
            { label: '界面文案', value: 'ui-texts' },
            { label: '首页', value: 'home-page' },
            { label: '关于我们', value: 'about-page' },
            { label: '产品列表页', value: 'products-page' },
            { label: '案例列表页', value: 'cases-page' },
            { label: '联系我们', value: 'contact-page' },
            { label: '辅助页面', value: 'pages' },
          ],
          admin: { condition: (_, sibling) => Boolean(sibling?.limited) },
        },
        {
          name: 'products',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          label: '可编辑的产品',
          admin: { condition: (_, sibling) => Boolean(sibling?.limited) },
        },
        {
          name: 'cases',
          type: 'relationship',
          relationTo: 'cases',
          hasMany: true,
          label: '可编辑的案例',
          admin: { condition: (_, sibling) => Boolean(sibling?.limited) },
        },
      ],
    },
  ],
}
