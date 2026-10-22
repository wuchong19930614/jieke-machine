// 页面找不到时先查跳转表，有规则就 301 跳转，否则显示 404（技术方案 3.9）
import { notFound, permanentRedirect } from 'next/navigation'

import { findRedirect } from './data'

export async function redirectOr404(path: string): Promise<never> {
  const target = await findRedirect(path)
  if (target && target !== path) permanentRedirect(target)
  notFound()
}
