// 后台首页的快捷入口和操作提示（技术方案 5.1）
import Link from 'next/link'
import type { ServerProps } from 'payload'

// roles 与各集合、页面的访问权限一致（技术方案 3.8）：只显示当前角色进得去的入口
const CONTENT = ['admin', 'editor', 'developer']
const LINKS = [
  { href: '/admin/globals/home-page', label: '编辑首页', roles: CONTENT },
  { href: '/admin/collections/products', label: '产品管理', roles: CONTENT },
  { href: '/admin/collections/cases', label: '案例管理', roles: CONTENT },
  { href: '/admin/collections/media', label: '媒体库', roles: CONTENT },
  { href: '/admin/collections/inquiries', label: '询盘管理', roles: ['admin', 'sales'] },
  { href: '/admin/globals/site-settings', label: '全站设置', roles: CONTENT },
  { href: '/admin/search', label: '查找内容', roles: ['admin', 'editor', 'sales', 'developer'] },
  { href: '/admin/content-transfer', label: '内容导入导出', roles: ['admin', 'developer'] },
]

export function BeforeDashboard({ user }: ServerProps) {
  const role = (user as { role?: string } | undefined)?.role ?? ''
  const links = LINKS.filter((link) => link.roles.includes(role))
  return (
    <div className="jk-dashboard">
      <h2 className="jk-dashboard__title">快捷入口</h2>
      <div className="jk-dashboard__links">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="jk-dashboard__link">
            {link.label}
          </Link>
        ))}
      </div>
      <ol className="jk-dashboard__tips">
        <li>修改内容后先点“保存草稿”，在右侧预览确认，再点“发布”。草稿不影响线上网站。</li>
        <li>前台所有文字必须用英文；出现中文时系统会阻止发布并标出字段。</li>
        <li>编辑页右上角打开“实时预览”后，点任意字段旁的“在前台定位”，可在预览里找到对应位置；预览里开启“定位模式”可点回后台字段。</li>
        <li>图片上传前请填写英文替代文字；单张图片不超过 20MB，PDF 不超过 30MB。</li>
      </ol>
    </div>
  )
}
