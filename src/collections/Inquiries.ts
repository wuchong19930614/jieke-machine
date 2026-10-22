// 询盘（技术方案 3.7）：只能通过前台接口新增，后台不能手工新建
import type { CollectionConfig, Field } from 'payload'

import { denyAll, isAdmin, isAdminOrSales } from '@/access'
import { INQUIRY_SOURCES, INQUIRY_STATUSES, MAIL_STATUSES, SPAM_FLAGS } from '@/lib/constants'
import { getCountries } from '@/lib/countries'

// 导出 CSV 时，以 = + - @ 或制表符、回车开头的文字前面加单引号，避免 Excel 把访客填写的内容当公式执行
const csvSafe = ({ value, format }: { value: unknown; format: string }) =>
  format === 'csv' && typeof value === 'string' && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
const csvSafeCustom = { 'plugin-import-export': { hooks: { beforeExport: csvSafe } } }
const TEXT_TYPES = ['text', 'textarea', 'email']

// 客户填写和系统记录的内容在后台只读，只有跟进字段可改
const ro = (field: Field): Field =>
  ({
    ...field,
    ...(TEXT_TYPES.includes(field.type) ? { custom: { ...(field.custom ?? {}), ...csvSafeCustom } } : {}),
    admin: { ...(field.admin ?? {}), readOnly: true },
  }) as Field

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: '询盘', plural: '询盘管理' },
  admin: {
    group: '询盘管理',
    useAsTitle: 'inquiryRef',
    defaultColumns: ['createdAt', 'source', 'name', 'country', 'productName', 'status', 'notifyStatus', 'spamFlag'],
    listSearchableFields: ['name', 'email', 'company', 'inquiryRef'],
    description: '询盘保存满 1 年后自动删除；删除后最多还会在加密备份中保留 30 天',
  },
  access: {
    read: isAdminOrSales,
    create: denyAll,
    update: isAdminOrSales,
    delete: isAdmin,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        ro({ name: 'inquiryRef', type: 'text', label: '询盘编号', unique: true, index: true, admin: { width: '50%' } }),
        ro({ name: 'source', type: 'select', label: '来源', required: true, options: [...INQUIRY_SOURCES], admin: { width: '50%' } }),
      ],
    },
    {
      type: 'collapsible',
      label: '客户填写',
      fields: [
        {
          type: 'row',
          fields: [
            ro({ name: 'name', type: 'text', label: '姓名', required: true, admin: { width: '50%' } }),
            ro({ name: 'email', type: 'email', label: '邮箱', required: true, admin: { width: '50%' } }),
          ],
        },
        {
          type: 'row',
          fields: [
            ro({ name: 'country', type: 'select', label: '国家 / 地区', options: getCountries().map((c) => ({ label: c.name, value: c.code })), admin: { width: '50%' } }),
            ro({ name: 'phone', type: 'text', label: '电话 / WhatsApp', admin: { width: '50%' } }),
          ],
        },
        {
          type: 'row',
          fields: [
            ro({ name: 'company', type: 'text', label: '公司', admin: { width: '50%' } }),
            ro({ name: 'productModel', type: 'text', label: '客户填写的产品 / 型号', admin: { width: '50%' } }),
          ],
        },
        ro({ name: 'requirements', type: 'textarea', label: '需求', required: true }),
      ],
    },
    {
      type: 'collapsible',
      label: '关联产品',
      admin: { initCollapsed: true },
      fields: [
        ro({ name: 'product', type: 'relationship', relationTo: 'products', label: '产品记录' }),
        {
          type: 'row',
          fields: [
            ro({ name: 'productName', type: 'text', label: '提交时的产品名称', admin: { width: '50%' } }),
            ro({ name: 'productCode', type: 'text', label: '提交时的产品编号', admin: { width: '50%' } }),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '访问来源',
      admin: { initCollapsed: true },
      fields: [
        ro({ name: 'pageUrl', type: 'text', label: '提交页面' }),
        ro({ name: 'landingPage', type: 'text', label: '首次进入的落地页' }),
        ro({ name: 'referrer', type: 'text', label: '来源网站' }),
        {
          type: 'row',
          fields: [
            ro({ name: 'utmSource', type: 'text', label: 'utm_source', admin: { width: '33%' } }),
            ro({ name: 'utmMedium', type: 'text', label: 'utm_medium', admin: { width: '33%' } }),
            ro({ name: 'utmCampaign', type: 'text', label: 'utm_campaign', admin: { width: '33%' } }),
          ],
        },
        {
          type: 'row',
          fields: [
            ro({ name: 'utmTerm', type: 'text', label: 'utm_term', admin: { width: '50%' } }),
            ro({ name: 'utmContent', type: 'text', label: 'utm_content', admin: { width: '50%' } }),
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: '跟进状态',
      required: true,
      defaultValue: 'new',
      options: [...INQUIRY_STATUSES],
      admin: { position: 'sidebar' },
    },
    {
      name: 'assignee',
      type: 'relationship',
      relationTo: 'users',
      label: '跟进人',
      admin: { position: 'sidebar' },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: '跟进备注',
      custom: { allowChinese: true, ...csvSafeCustom },
      admin: { position: 'sidebar' },
    },
    {
      name: 'resend',
      type: 'ui',
      admin: { position: 'sidebar', components: { Field: '@/admin/components/ResendButton#ResendButton' } },
    },
    {
      type: 'collapsible',
      label: '邮件发送',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            ro({ name: 'notifyStatus', type: 'select', label: '通知邮件', options: [...MAIL_STATUSES], defaultValue: 'pending', admin: { width: '33%' } }),
            ro({ name: 'notifyAttempts', type: 'number', label: '通知已发送次数', defaultValue: 0, admin: { width: '33%' } }),
            ro({ name: 'notifyError', type: 'text', label: '通知失败原因', admin: { width: '33%' } }),
          ],
        },
        {
          type: 'row',
          fields: [
            ro({ name: 'autoReplyStatus', type: 'select', label: '客户自动回复', options: [...MAIL_STATUSES], defaultValue: 'pending', admin: { width: '33%' } }),
            ro({ name: 'autoReplyAttempts', type: 'number', label: '自动回复已发送次数', defaultValue: 0, admin: { width: '33%' } }),
            ro({ name: 'autoReplyError', type: 'text', label: '自动回复失败原因', admin: { width: '33%' } }),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '系统记录',
      admin: { initCollapsed: true },
      fields: [
        ro({ name: 'spamFlag', type: 'select', label: '可疑标记', options: [...SPAM_FLAGS], defaultValue: 'none' }),
        ro({ name: 'ipHash', type: 'text', label: 'IP 哈希', index: true, admin: { description: '只存哈希值，用于防刷，不存原始 IP' } }),
        ro({ name: 'userAgent', type: 'text', label: '浏览器信息' }),
        ro({ name: 'submissionId', type: 'text', label: '提交编号', unique: true, index: true }),
      ],
    },
  ],
}
