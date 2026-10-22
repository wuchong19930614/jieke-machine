// 后台“内容导入导出”页面（技术方案 5.3 第 7 点）
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { ContentTransferClient } from './ContentTransferClient'

export function ContentTransferView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  if (!req.user) redirect('/admin/login')
  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <h1 className="jk-view__title">内容导入导出</h1>
        <p className="jk-view__desc">
          产品和案例：在
          <Link href="/admin/collections/products"> 产品管理</Link>、<Link href="/admin/collections/cases">案例管理</Link>
          列表右上角使用“导出 / 导入”，格式为 JSON。导入方式选“更新”或“新增或更新”、匹配字段选 id，在同一个网站里会保留关联的产品、案例和媒体引用，可用来恢复误改的内容。导入后为草稿，检查后再发布。
        </p>
        <p className="jk-view__desc">
          <Link href="/admin/collections/media">媒体库</Link>
          只能导出记录清单，不能导入：导入工具不会带上图片和 PDF 文件。在测试站和正式站之间整体迁移内容，请用每日数据库备份恢复，并复制媒体文件（见 README“备份与恢复”），这样编号、关联和图片都保持一致。
        </p>
        <ContentTransferClient />
      </Gutter>
    </DefaultTemplate>
  )
}
