// 全局配置的公共部分：草稿与版本、权限、发布前检查、发布后刷新
import type { Field, GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { globalEditAccess, isLoggedIn } from '@/access'
import { rejectChineseOnPublishGlobal } from '@/hooks/publishChecks'
import { revalidate, type RevalidateTarget } from '@/hooks/revalidate'

type GlobalAdmin = NonNullable<GlobalConfig['admin']>
type GlobalAdminElements = NonNullable<NonNullable<GlobalAdmin['components']>['elements']>

type Options = {
  slug: string
  label: string
  group: string
  fields: Field[]
  refresh: RevalidateTarget[]
  description?: string
  beforeDocumentControls?: GlobalAdminElements['beforeDocumentControls']
  editViews?: NonNullable<NonNullable<GlobalAdmin['components']>['views']>['edit']
}

export function editableGlobal({ slug, label, group, fields, refresh, description, beforeDocumentControls = [], editViews }: Options): GlobalConfig {
  const afterChange: GlobalAfterChangeHook = ({ doc, previousDoc, req }) => {
    if (doc?._status === 'published' || previousDoc?._status === 'published') revalidate(req, refresh)
    return doc
  }
  return {
    slug,
    label,
    admin: {
      group,
      description,
      // 从没发布过时在保存按钮前提示：前台正在用默认内容
      components: {
        elements: { beforeDocumentControls: ['@/admin/components/NeverPublishedNote#NeverPublishedNote', ...beforeDocumentControls] },
        ...(editViews && { views: { edit: editViews } }),
      },
    },
    access: {
      read: isLoggedIn,
      update: globalEditAccess(slug),
      readVersions: isLoggedIn,
    },
    versions: { drafts: { autosave: false, schedulePublish: false }, max: 50 },
    hooks: {
      beforeChange: [rejectChineseOnPublishGlobal],
      afterChange: [afterChange],
    },
    fields,
  }
}
