// 后台左侧菜单（技术方案 5.1）：按方案规定的顺序排列分组和条目，顺序和原因见 src/admin/navOrder.ts。
// 这里照 @payloadcms/next 3.91.0 的 DefaultNav 拼装菜单，只改条目顺序；没有用到的扩展位（beforeNav、settingsMenu 等）不渲染。
// 升级 Payload 后要对照新版 DefaultNav 回归检查
import { DefaultNavClient, NavHamburger, NavWrapper } from '@payloadcms/next/client'
import { Logout } from '@payloadcms/ui'
import { type EntityToGroup, EntityType, groupNavItems } from '@payloadcms/ui/shared'
import type { NavPreferences, ServerProps } from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'

import { navRank } from '@/admin/navOrder'

export async function Nav({ payload, permissions, i18n, user, visibleEntities }: ServerProps) {
  if (!payload?.config || !i18n || !visibleEntities) return null
  const entities: EntityToGroup[] = [
    ...payload.config.collections.filter(({ slug }) => visibleEntities.collections.includes(slug)).map((entity) => ({ type: EntityType.collection as const, entity })),
    ...payload.config.globals.filter(({ slug }) => visibleEntities.globals.includes(slug)).map((entity) => ({ type: EntityType.global as const, entity })),
  ]
  const rank = (item: EntityToGroup) => navRank(item.type, item.entity.slug)
  const groups = groupNavItems([...entities].sort((a, b) => rank(a) - rank(b)), permissions!, i18n)

  // 菜单分组的展开 / 收起记录，与 DefaultNav 的 getNavPrefs 相同
  const userId = (user as { id?: number | string } | null | undefined)?.id
  const navPreferences = userId
    ? (
        await payload.find({
          collection: 'payload-preferences',
          depth: 0,
          limit: 1,
          pagination: false,
          where: {
            and: [{ key: { equals: PREFERENCE_KEYS.NAV } }, { 'user.relationTo': { equals: 'users' } }, { 'user.value': { equals: userId } }],
          },
        })
      ).docs[0]?.value
    : null

  return (
    <NavWrapper baseClass="nav">
      <nav className="nav__wrap">
        <DefaultNavClient groups={groups} navPreferences={navPreferences as NavPreferences} />
        <div className="nav__controls">
          <Logout />
        </div>
      </nav>
      <div className="nav__header">
        <div className="nav__header-content">
          <NavHamburger baseClass="nav" />
        </div>
      </div>
    </NavWrapper>
  )
}
