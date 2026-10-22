// 发布后刷新受影响的静态页面（技术方案 2.3）
import { revalidatePath } from 'next/cache'
import type { PayloadRequest } from 'payload'

export type RevalidateTarget = { path: string; type?: 'page' | 'layout' }

export const PATHS = {
  everything: { path: '/', type: 'layout' } as RevalidateTarget,
  home: { path: '/' } as RevalidateTarget,
  about: { path: '/about/' } as RevalidateTarget,
  contact: { path: '/contact/' } as RevalidateTarget,
  productList: { path: '/products/' } as RevalidateTarget,
  productDetails: { path: '/products/[slug]', type: 'page' } as RevalidateTarget,
  caseList: { path: '/case-studies/' } as RevalidateTarget,
  casePages: { path: '/case-studies/page/[n]', type: 'page' } as RevalidateTarget,
  caseDetails: { path: '/case-studies/[slug]', type: 'page' } as RevalidateTarget,
  sitemap: { path: '/sitemap.xml' } as RevalidateTarget,
}

// 脚本（如导入测试数据）里没有 Next.js 运行环境，调用 revalidatePath 会抛错，这里统一吞掉
export function revalidate(req: PayloadRequest, targets: RevalidateTarget[]): void {
  if (req.context?.disableRevalidate) return
  for (const target of targets) {
    try {
      if (target.type) revalidatePath(target.path, target.type)
      else revalidatePath(target.path)
    } catch (error) {
      req.payload.logger.debug({ err: error, msg: `跳过页面刷新：${target.path}` })
    }
  }
}
