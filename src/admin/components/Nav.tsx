// 后台左侧菜单（技术方案 5.1）：按方案规定的顺序排列分组和条目，顺序和原因见 src/admin/navOrder.ts。
// 这里照 @payloadcms/next 3.91.0 的 DefaultNav 拼装菜单，只改条目顺序；没有用到的扩展位（beforeNav、settingsMenu 等）不渲染。
// 升级 Payload 后要对照新版 DefaultNav 回归检查。
// 顶部加了网站标识（全站设置的网站图标 + 公司名），菜单的样式和每项图标在 src/app/(payload)/custom.scss 的“后台整体视觉”一节
import { DefaultNavClient, NavHamburger, NavWrapper } from '@payloadcms/next/client'
import { Logout } from '@payloadcms/ui'
import { type EntityToGroup, EntityType, groupNavItems } from '@payloadcms/ui/shared'
import type { NavPreferences, ServerProps } from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'

import { navRank } from '@/admin/navOrder'

import { NavActive } from './NavActive'

type Brand = { name: string; icon: string | null }

// 菜单顶部的网站标识：优先用苹果触屏图标（正方形大图），没有时用网站图标，都没有就显示公司名首字母
async function loadBrand(payload: NonNullable<ServerProps['payload']>): Promise<Brand> {
  try {
    const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 1 })) as {
      companyName?: string | null
      appleTouchIcon?: { url?: string | null } | number | null
      favicon?: { url?: string | null } | number | null
    }
    const url = (value: unknown) => (value && typeof value === 'object' && 'url' in value ? ((value as { url?: string | null }).url ?? null) : null)
    return { name: settings.companyName?.trim() || '网站后台', icon: url(settings.appleTouchIcon) ?? url(settings.favicon) }
  } catch {
    return { name: '网站后台', icon: null }
  }
}

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

  const brand = await loadBrand(payload)
  const adminRoute = payload.config.routes.admin

  return (
    <NavWrapper baseClass="nav">
      <nav className="nav__wrap">
        <a href={adminRoute} className="jk-nav-brand" title="回到后台首页">
          <span className="jk-nav-brand__logo">
            {/* eslint-disable-next-line @next/next/no-img-element -- 后台小图标直接用媒体地址 */}
            {brand.icon ? <img src={brand.icon} alt="" /> : brand.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="jk-nav-brand__text">
            <b>{brand.name}</b>
            <small>网站后台</small>
          </span>
        </a>
        <DefaultNavClient groups={groups} navPreferences={navPreferences as NavPreferences} />
        <NavActive />
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
