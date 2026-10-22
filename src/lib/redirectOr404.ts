// 页面找不到时先查跳转表，有规则就永久跳转，否则显示 404（技术方案 3.9）。
// 页面里只能用 permanentRedirect，状态码固定是 308；搜索引擎对 308 和 301 一样按永久跳转处理
import { notFound, permanentRedirect } from 'next/navigation'

import { findRedirect } from './data'

export async function redirectOr404(path: string): Promise<never> {
  const target = await findRedirect(path)
  if (target && target !== path) permanentRedirect(target)
  notFound()
}
