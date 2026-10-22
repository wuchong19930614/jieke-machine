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
          产品、案例和媒体记录：在
          <Link href="/admin/collections/products"> 产品管理</Link>、<Link href="/admin/collections/cases">案例管理</Link>、
          <Link href="/admin/collections/media">媒体库</Link>
          列表右上角使用“导出 / 导入”，格式为 JSON，导入时按编号保留关联记录和媒体引用。跨环境迁移时，先导入媒体记录和图片文件，再导入产品和案例。
        </p>
        <ContentTransferClient />
      </Gutter>
    </DefaultTemplate>
  )
}
