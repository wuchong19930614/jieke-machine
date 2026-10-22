import type { Field } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { defaultsOf, fill, textFields, withDefaults } from '@/content/defineTexts'
import { AUTO_REPLY_TEXTS } from '@/content/texts'
import { toSlug } from '@/fields'
import { findChinese } from '@/hooks/publishChecks'
import { findUploadRefs } from '@/hooks/mediaGuard'
import { normalizePath } from '@/hooks/slugRedirect'
import { COUNTRY_CODES, getCountries } from '@/lib/countries'
import { labelForPath, walkFields } from '@/lib/fieldWalk'
import { buildAutoReply } from '@/lib/server/inquiryMail'
import { maskEmail, safeError } from '@/lib/server/logSafe'
import { sendMail } from '@/lib/server/mail'
import { uniqueConflictField } from '@/lib/server/inquiryRef'
import { activeStepIndex } from '@/components/client/ProcessSteps'
import { Inquiries } from '@/collections/Inquiries'
import { Users } from '@/collections/Users'
import { countLinks, validateInquiry } from '@/lib/inquirySchema'
import { defaultSpecTable, normalizeSpecTable, publicRows, validateSpecTable } from '@/lib/specTable'
import { whatsappLink } from '@/lib/whatsapp'
import { youtubeId } from '@/lib/youtube'
import type { Inquiry } from '@/payload-types'

describe('参数表', () => {
  it('新建产品预填 17 行且默认不公开，不重复预填产品编号和型号', () => {
    const table = defaultSpecTable()
    expect(table.rows).toHaveLength(17)
    expect(table.rows.every((r) => !r.public)).toBe(true)
    expect(table.rows.map((r) => r.label)).not.toContain('Model')
  })

  it('数值按型号 id 保存，调整型号顺序或删除型号都不会错位', () => {
    const table = normalizeSpecTable({
      models: [
        { id: 'm1', name: 'LT-100' },
        { id: 'm2', name: 'LT-300' },
      ],
      rows: [{ id: 'r1', label: 'Capacity (kg/h)', public: true, values: { m1: '100', m2: '300', ghost: 'x' } }],
    })
    expect(table.rows[0].values).toEqual({ m1: '100', m2: '300' })
    const reordered = normalizeSpecTable({ ...table, models: [table.models[1], table.models[0]] })
    expect(reordered.rows[0].values.m2).toBe('300')
    const removed = normalizeSpecTable({ ...table, models: [table.models[1]] })
    expect(removed.rows[0].values).toEqual({ m2: '300' })
  })

  it('编辑中保留空格，保存时去掉首尾空格和空值', () => {
    const raw = { models: [{ id: 'm1', name: 'LT ' }], rows: [{ id: 'r1', label: 'Based on ', public: false, values: { m1: ' ' } }] }
    expect(normalizeSpecTable(raw, { trim: false }).rows[0].label).toBe('Based on ')
    const saved = normalizeSpecTable(raw)
    expect(saved.models[0].name).toBe('LT')
    expect(saved.rows[0].values).toEqual({})
  })

  it('校验型号名不能为空或重复，公开参数前需要型号', () => {
    expect(validateSpecTable({ models: [{ id: 'm1', name: '' }], rows: [] })).toContain('型号名')
    expect(validateSpecTable({ models: [{ id: 'a', name: 'X' }, { id: 'b', name: 'x' }], rows: [] })).toContain('不能重复')
    expect(validateSpecTable({ models: [], rows: [{ id: 'r1', label: 'A', public: true, values: {} }] })).toContain('至少添加一个型号')
    expect(validateSpecTable(defaultSpecTable())).toBe(true)
  })

  it('前台只显示公开且有数值的行', () => {
    const table = normalizeSpecTable({
      models: [{ id: 'm1', name: 'A' }],
      rows: [
        { id: 'r1', label: 'Shown', public: true, values: { m1: '1' } },
        { id: 'r2', label: 'Private', public: false, values: { m1: '2' } },
        { id: 'r3', label: 'Empty', public: true, values: {} },
      ],
    })
    expect(publicRows(table).map((r) => r.label)).toEqual(['Shown'])
  })
})

describe('询盘校验', () => {
  const base = { source: 'contact_page', name: 'John', email: 'john@example.com', country: 'SA', requirements: 'Need a line' }

  it('合法提交通过，选填字段留空时去掉', () => {
    const result = validateInquiry({ ...base, phone: '', company: '  ' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.phone).toBeUndefined()
      expect(result.data.company).toBeUndefined()
    }
  })

  it('必填项和格式错误返回对应的文案键', () => {
    const result = validateInquiry({ source: 'contact_page', name: '', email: 'bad', requirements: '' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toMatchObject({
        name: 'errNameRequired',
        email: 'errEmailInvalid',
        country: 'errCountryRequired',
        requirements: 'errRequirementsRequired',
      })
    }
  })

  it('离线留言的国家选填，其他表单必填；国家必须是 ISO 代码', () => {
    expect(validateInquiry({ ...base, source: 'offline_message', country: '' }).ok).toBe(true)
    expect(validateInquiry({ ...base, country: '' }).ok).toBe(false)
    expect(validateInquiry({ ...base, country: 'XX' }).ok).toBe(false)
  })

  it('长度上限', () => {
    const result = validateInquiry({ ...base, name: 'a'.repeat(101), phone: '1'.repeat(31), requirements: 'x'.repeat(5001) })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors).toMatchObject({ name: 'errNameTooLong', phone: 'errPhoneTooLong', requirements: 'errRequirementsTooLong' })
  })

  it('统计需求里的网址个数', () => {
    expect(countLinks('see http://a.com https://b.com www.c.com and http://d.com')).toBe(4)
    expect(countLinks('no links here')).toBe(0)
  })
})

describe('表单令牌', () => {
  it('签名正确且在有效期内才有效，篡改或过期都无效', async () => {
    vi.stubEnv('PAYLOAD_SECRET', 'test-secret-for-vitest')
    const { checkFormToken, issueFormToken, FORM_TOKEN_TTL_SECONDS } = await import('@/lib/server/formToken')
    const now = Date.now()
    const token = issueFormToken(now - 5000)
    const check = checkFormToken(token, now)
    expect(check.valid).toBe(true)
    if (check.valid) expect(check.ageMs).toBe(5000)
    expect(checkFormToken(`${token}x`, now).valid).toBe(false)
    const [payload] = token.split('.')
    const forged = `${Buffer.from(JSON.stringify({ t: now - 60000 })).toString('base64url')}.${token.split('.')[1]}`
    expect(payload).not.toBe(forged.split('.')[0])
    expect(checkFormToken(forged, now).valid).toBe(false)
    expect(checkFormToken(issueFormToken(now - FORM_TOKEN_TTL_SECONDS * 1000 - 1), now).valid).toBe(false)
    expect(checkFormToken(undefined, now).valid).toBe(false)
  })
})

describe('文案工具', () => {
  const defs = { title: ['标题', 'Hello'], sub: ['副标题', ''] } as const
  it('后台留空时用默认文案', () => {
    expect(defaultsOf(defs)).toEqual({ title: 'Hello', sub: '' })
    expect(withDefaults(defs, { title: '  ', sub: 'Sub' })).toEqual({ title: 'Hello', sub: 'Sub' })
    expect(withDefaults(defs, null)).toEqual({ title: 'Hello', sub: '' })
  })
  it('变量替换；任一变量为空时整句返回空串', () => {
    expect(fill('Email: {businessEmail}', { businessEmail: 'a@b.com' })).toBe('Email: a@b.com')
    expect(fill('Email: {businessEmail}', { businessEmail: '' })).toBe('')
    expect(fill('{n} / {total}', { n: 1, total: 4 })).toBe('1 / 4')
  })
})

describe('网址和链接', () => {
  it('网址短名只保留小写字母、数字和连字符', () => {
    expect(toSlug('Garlic & Onion Processing Line')).toBe('garlic-and-onion-processing-line')
    expect(toSlug('  Café Crème 300 ')).toBe('cafe-creme-300')
  })
  it('跳转路径统一为带斜杠结尾', () => {
    expect(normalizePath('products/a')).toBe('/products/a/')
    expect(normalizePath('/products/a/?x=1')).toBe('/products/a/')
    expect(normalizePath('/')).toBe('/')
  })
  it('YouTube 链接解析', () => {
    expect(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1')).toBe('dQw4w9WgXcQ')
    expect(youtubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeId('https://vimeo.com/123')).toBeNull()
  })
  it('WhatsApp 链接只保留号码数字', () => {
    expect(whatsappLink('+86 138-0000 0000', 'Hi there')).toBe('https://wa.me/8613800000000?text=Hi%20there')
  })
  it('国家列表 249 个且按英文名排序', () => {
    expect(COUNTRY_CODES).toHaveLength(249)
    const names = getCountries().map((c) => c.name)
    expect([...names].sort((a, b) => a.localeCompare(b, 'en'))).toEqual(names)
  })
})

describe('按字段定义遍历', () => {
  const fields: Field[] = [
    { name: 'name', type: 'text', label: '英文名称' },
    { name: 'nameZh', type: 'text', label: '中文名称', custom: { allowChinese: true } },
    {
      type: 'collapsible',
      label: '8 FAQ',
      fields: [
        {
          name: 'faqs',
          type: 'array',
          label: '常见问题',
          fields: [
            { name: 'question', type: 'text', label: '问题' },
            { name: 'image', type: 'upload', relationTo: 'media', label: '图片' },
          ],
        },
      ],
    },
    { name: 'body', type: 'richText', label: '正文' },
  ]

  it('发布前找出含中文的字段（允许中文的字段除外）', () => {
    const problems = findChinese(fields, {
      name: 'Line 中文',
      nameZh: '辣条生产线',
      faqs: [{ question: 'OK?' }, { question: '可以吗？' }],
      body: { root: { children: [{ children: [{ text: '正文' }] }] } },
    })
    expect(problems.map((p) => p.path)).toEqual(['name', 'faqs.1.question', 'body'])
  })

  it('找出引用某个媒体的字段', () => {
    const refs = findUploadRefs(fields, { faqs: [{ image: 7 }, { image: { id: 8 } }], body: { root: { children: [{ type: 'upload', relationTo: 'media', value: { id: 8 } }] } } }, '8')
    expect(refs).toEqual(['faqs.2.image', 'body'])
  })

  it('按路径取字段的中文名称（忽略数组下标）', () => {
    expect(labelForPath(fields, 'faqs.3.question')).toBe('8 FAQ › 常见问题 › 问题')
    expect(labelForPath(fields, 'missing')).toBeNull()
  })
})

describe('字段路径名称', () => {
  it('折叠分组和里面的组同名时只保留一层', () => {
    const fields: Field[] = [
      { type: 'collapsible', label: '顶栏', fields: [{ name: 'topBar', type: 'group', label: '顶栏', fields: [{ name: 'tagline', type: 'text', label: '标语' }] }] },
    ]
    expect(labelForPath(fields, 'topBar.tagline')).toBe('顶栏 › 标语')
  })
})

describe('询盘自动回复', () => {
  const inquiry = { id: 1, inquiryRef: 'INQ-1', name: 'Ana', email: 'ana@example.com', productName: 'Food Drying Line' } as Inquiry
  const texts = withDefaults(AUTO_REPLY_TEXTS, null)

  it('公司名以句点结尾时不出现双句点，产品名写进正文', () => {
    const mail = buildAutoReply(inquiry, texts, { companyName: 'Sample Co., Ltd.', email: 'sales@example.com', phone: '', whatsapp: '' })!
    expect(mail.text).toContain('Thank you for contacting Sample Co., Ltd. We have received your inquiry about Food Drying Line')
    expect(mail.text).not.toMatch(/[^.]\.\.[^.]/)
  })

  it('联系方式为空时整行不写，姓名含网址时改用通用称呼', () => {
    const mail = buildAutoReply({ ...inquiry, name: 'see www.spam.example' }, texts, { companyName: 'Sample', email: 'sales@example.com', phone: '', whatsapp: '' })!
    expect(mail.text.startsWith('Hello,')).toBe(true)
    expect(mail.text).not.toContain('Phone:')
    expect(mail.text).toContain('Email: sales@example.com')
    expect(mail.replyTo).toBe('sales@example.com')
  })
})

describe('询盘写入冲突', () => {
  it('从 Payload 的 ValidationError 里取出冲突字段，其他错误返回 null', () => {
    const conflict = Object.assign(new Error('下面的字段是无效的： submissionId'), {
      name: 'ValidationError',
      data: { collection: 'inquiries', errors: [{ message: '值必须是唯一的', path: 'submissionId' }] },
    })
    expect(uniqueConflictField(conflict)).toBe('submissionId')
    expect(uniqueConflictField(new Error('SQLITE_BUSY'))).toBeNull()
    expect(uniqueConflictField(null)).toBeNull()
  })
})

describe('询盘 CSV 导出', () => {
  // 在字段配置里找到导出钩子（字段可能嵌在 row、collapsible 里）
  const findField = (fields: Field[], name: string): Field | undefined => {
    for (const field of fields) {
      if ('name' in field && field.name === name) return field
      if ('fields' in field && Array.isArray(field.fields)) {
        const found = findField(field.fields as Field[], name)
        if (found) return found
      }
    }
    return undefined
  }
  const hookOf = (name: string) =>
    (findField(Inquiries.fields, name)?.custom?.['plugin-import-export'] as { hooks?: { beforeExport?: (args: { value: unknown; format: string }) => unknown } } | undefined)?.hooks?.beforeExport

  it('访客填写的文字以公式符号开头时加单引号，只在 CSV 里处理', () => {
    const hook = hookOf('name')!
    expect(hook({ value: '=HYPERLINK("http://evil","x")', format: 'csv' })).toBe('\'=HYPERLINK("http://evil","x")')
    expect(hook({ value: '+86 138', format: 'csv' })).toBe("'+86 138")
    expect(hook({ value: 'John', format: 'csv' })).toBe('John')
    expect(hook({ value: '=1+1', format: 'json' })).toBe('=1+1')
    expect(hookOf('requirements')).toBeTypeOf('function')
    expect(hookOf('notes')).toBeTypeOf('function')
  })
})

describe('后台密码规则', () => {
  const hook = Users.hooks!.beforeOperation![0]
  const run = (operation: string, password?: string) => hook({ args: { data: { password } }, operation } as never)

  it('新建、修改和忘记密码重置都要求至少 12 位', () => {
    expect(() => run('resetPassword', 'abc')).toThrow()
    expect(() => run('create', 'short-pass')).toThrow()
    expect(() => run('update', 'LongEnough-2026')).not.toThrow()
    expect(() => run('update')).not.toThrow()
    expect(() => run('login', 'abc')).not.toThrow()
  })
})

describe('隐藏勾选（技术方案 5.2）', () => {
  const defs = { title: ['标题', 'Hello', { hideable: true }], note: ['说明', 'Note'] } as const

  it('勾选隐藏后返回空串，填写的文字仍保留在后台数据里', () => {
    expect(withDefaults(defs, { title: 'Custom', titleHidden: true })).toEqual({ title: '', note: 'Note' })
    expect(withDefaults(defs, { title: '', titleHidden: false })).toEqual({ title: 'Hello', note: 'Note' })
    // 不可隐藏的字段即使有同名标记也不受影响
    expect(withDefaults(defs, { noteHidden: true }).note).toBe('Note')
  })

  it('可隐藏的字段和“隐藏”勾选放在同一行，数据路径不变', () => {
    const fields = textFields(defs, '首页')
    expect(fields[0]).toMatchObject({ type: 'row', fields: [{ name: 'title', type: 'text' }, { name: 'titleHidden', type: 'checkbox', defaultValue: false }] })
    expect(fields[1]).toMatchObject({ name: 'note', type: 'text' })
    expect(labelForPath(fields, 'titleHidden')).toBe('隐藏标题')
  })

  it('查找内容把勾选了隐藏的文字标为已隐藏', () => {
    const seen: Record<string, boolean> = {}
    walkFields(textFields(defs, '首页'), { title: 'Hi', titleHidden: true, note: 'N' }, (leaf) => {
      seen[leaf.path] = leaf.hidden
    })
    expect(seen).toMatchObject({ title: true, note: false })
  })
})

describe('发信未配置', () => {
  it('没有配置发信服务时按失败返回，询盘不会记成已发送', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('MAIL_FROM', '')
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const result = await sendMail({ to: 'a@example.com', subject: 'S', text: 'T', html: '<p>T</p>' })
    expect(result).toMatchObject({ ok: false, notConfigured: true })
    expect(log).toHaveBeenCalledOnce()
    log.mockRestore()
    vi.unstubAllEnvs()
  })
})

describe('工艺步骤选中', () => {
  const steps = [{ key: 'a' }, { key: 'b' }, { key: 'c' }]

  it('按条目编号找选中的步骤，调整顺序后仍是同一步', () => {
    expect(activeStepIndex(steps, 'c')).toBe(2)
    expect(activeStepIndex([{ key: 'c' }, { key: 'a' }, { key: 'b' }], 'c')).toBe(0)
  })

  it('还没选过，或选中的步骤已被删除、隐藏时回到第一步', () => {
    expect(activeStepIndex(steps, null)).toBe(0)
    expect(activeStepIndex(steps, 'gone')).toBe(0)
  })
})

describe('日志不带客户资料', () => {
  it('数据库报错只留错误类型和不含参数的第一行', () => {
    const cause = Object.assign(new Error('SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: inquiries.submission_id'), { name: 'LibsqlError' })
    const error = Object.assign(
      new Error('Failed query: insert into "inquiries" ("name", "email") values (?, ?)\nparams: John Smith,john@example.com,+966 50 123 4567'),
      { cause },
    )
    const safe = safeError(error)
    expect(safe).toEqual({
      name: 'Error',
      message: 'Failed query: insert into "inquiries" ("name", "email") values (?, ?)',
      cause: 'SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: inquiries.submission_id',
    })
    expect(JSON.stringify(safe)).not.toMatch(/John|john@|966/)
  })

  it('邮箱打码只留首字母和域名', () => {
    expect(maskEmail('john.smith@example.com')).toBe('j***@example.com')
    expect(maskEmail('not-an-email')).toBe('not-an-email')
  })
})
