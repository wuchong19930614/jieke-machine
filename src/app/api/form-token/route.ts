// GET /api/form-token：签发表单令牌（技术方案 6.5）
import { FORM_TOKEN_TTL_SECONDS, issueFormToken } from '@/lib/server/formToken'

export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(
    { token: issueFormToken(), expiresIn: FORM_TOKEN_TTL_SECONDS },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
