// 备份记录（技术方案 3.9、9.2）：由定时任务写入，管理员和开发协作在后台查看
import type { CollectionConfig } from 'payload'

import { denyAll, isAdmin, isAdminOrDeveloper } from '@/access'

export const Backups: CollectionConfig = {
  slug: 'backups',
  labels: { singular: '备份记录', plural: '备份记录' },
  admin: {
    group: '系统',
    useAsTitle: 'file',
    defaultColumns: ['createdAt', 'kind', 'status', 'sizeBytes', 'download'],
    description: '每天 02:00–02:59（UTC）之间先备份数据库，再备份新增的图片和 PDF。失败时会给管理员发邮件。',
  },
  access: {
    read: isAdminOrDeveloper,
    create: denyAll,
    update: denyAll,
    delete: isAdmin,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          label: '类型',
          required: true,
          options: [
            { label: '数据库', value: 'database' },
            { label: '媒体文件', value: 'media' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'status',
          type: 'select',
          label: '状态',
          required: true,
          options: [
            { label: '成功', value: 'success' },
            { label: '失败', value: 'failed' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'file', type: 'text', label: '文件路径', admin: { description: '私有 Blob 存储中的路径' } },
    {
      type: 'row',
      fields: [
        { name: 'sizeBytes', type: 'number', label: '文件大小（字节）', admin: { width: '25%' } },
        { name: 'tables', type: 'number', label: '数据表数', admin: { width: '25%' } },
        { name: 'rows', type: 'number', label: '导出行数', admin: { width: '25%' } },
        { name: 'durationMs', type: 'number', label: '耗时（毫秒）', admin: { width: '25%' } },
      ],
    },
    { name: 'filesCopied', type: 'number', label: '复制的媒体文件数' },
    { name: 'error', type: 'textarea', label: '失败原因' },
    {
      name: 'download',
      type: 'ui',
      label: '下载',
      admin: {
        components: {
          Field: '@/admin/components/BackupDownload#BackupDownloadField',
          Cell: '@/admin/components/BackupDownload#BackupDownloadCell',
        },
      },
    },
  ],
}
