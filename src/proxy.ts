// Next.js 16 的 proxy（原 middleware）。只匹配后台路径：payload-totp 需要从请求头读取当前路径，
// 否则验证页会无限跳转。前台页面不经过这里，避免每次访问都执行函数（技术方案 3.8 第 4 点、3.9）
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.append('x-pathname', request.nextUrl.pathname)
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
