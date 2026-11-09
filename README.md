# jieke-machine
捷科公司的海外独立站官网代码

面向海外采购客户的英文 B2B 网站（食品加工机械与生产线），前台英文、后台中文。设计依据见 `docs/机械设备独立站技术方案.md`，前台文案见 `docs/前台英文界面文案.md`，业务方原始资料在 `docs/业务资料/`。

## 目录

- [一、技术栈](#s1)
- [二、本地开发](#s2)
    - [2.1 环境要求](#s2-1)
    - [2.2 首次启动](#s2-2)
    - [2.3 本地测试账号与双重验证](#s2-3)
    - [2.4 常用命令](#s2-4)
- [三、环境变量](#s3)
- [四、目录结构](#s4)
- [五、数据库与迁移](#s5)
    - [5.1 本地与线上的差别](#s5-1)
    - [5.2 修改字段后的步骤](#s5-2)
- [六、接口](#s6)
    - [6.1 提交询盘](#s6-1)
    - [6.2 领取表单令牌](#s6-2)
    - [6.3 重发询盘邮件](#s6-3)
    - [6.4 草稿预览](#s6-4)
    - [6.5 定时任务](#s6-5)
    - [6.6 下载数据库备份](#s6-6)
- [七、备份与恢复](#s7)
- [八、测试与检查](#s8)
- [九、部署注意事项](#s9)
- [十、已知限制与未验证项](#s10)

<a id="s1"></a>

## 一、技术栈

- Next.js 16.4.2（App Router，`src/proxy.ts` 代替旧的 middleware）+ React 19 + TypeScript
- Payload CMS 3.91.0：后台内置在同一个项目里，地址 `/admin`，自带接口挂在 `/api/cms`
- 数据库：本地 SQLite 文件，线上 Turso（`@payloadcms/db-sqlite` + `@libsql/client`）
- 媒体：Vercel Blob（浏览器直传）；本地不配置时存到 `./media`
- 邮件：Resend（直接调用 HTTP 接口，没有引入 SDK）
- 后台双重验证：payload-totp 3.0.6，所有后台账号首次登录必须绑定
- 样式：沿用原型 v18 的 CSS（`src/app/(frontend)/globals.css`），没有使用 Tailwind
- 测试：Vitest

<a id="s2"></a>

## 二、本地开发

<a id="s2-1"></a>

### 2.1 环境要求

- Node.js 24.x（与 Vercel 线上一致，`package.json` 的 engines 和 `.node-version` 都写的 24）。本机装的是更高版本也能运行，`.npmrc` 里关闭了版本强校验，但写代码时按 24 的能力为准，不要用 24 没有的新特性。
- npm（依赖版本全部锁定为精确版本，`.npmrc` 开启了 `legacy-peer-deps`）

<a id="s2-2"></a>

### 2.2 首次启动

```bash
npm install
```

```bash
cp .env.example .env
```

在 `.env` 里填 `PAYLOAD_SECRET`、`CRON_SECRET`、`PREVIEW_SECRET`（各自用 `openssl rand -hex 32` 生成），其余留空即可在本地运行：数据库用 `./dev.db`，图片存 `./media`，邮件只打印到控制台，备份存 `./backups`。

```bash
npm run seed
```

写入示例数据（4 条生产线、3 个案例、首页和关于页内容、全站设置、隐私政策页）和本地测试账号。内容和图片都是程序生成的占位，正式内容由业务方在后台录入。脚本只允许写本地 `file:` 数据库；已经有产品时会跳过内容部分，想重新生成就删掉 `dev.db` 和 `media/` 再运行。

```bash
npm run dev
```

前台 http://localhost:3000 ，后台 http://localhost:3000/admin 。

<a id="s2-3"></a>

### 2.3 本地测试账号与双重验证

- 种子脚本会创建管理员、内容编辑、业务人员三个本地测试账号，邮箱和密码写在 `scripts/seed.ts` 的 `LOCAL_USERS` 里，只用于本地数据库。
- 首次登录会进入“设置双因素身份验证”页面，用手机上的验证器 App（如 Google Authenticator）扫码，输入 6 位验证码后才能进入后台。
- 只想快速调试界面时，可以在 `.env` 里设 `TOTP_DISABLED=true` 临时关闭双重验证；这个开关在生产环境无效。
- 系统里还没有账号时，第一个创建的账号自动成为管理员。

<a id="s2-4"></a>

### 2.4 常用命令

- `npm run dev`：开发模式
- `npm run build` / `npm run start`：本地生产构建与启动
- `npm run seed`：写入示例数据和本地测试账号
- `npm run migrate:create -- 名称`：根据字段变化生成数据库迁移
- `npm run migrate`：执行未执行过的迁移
- `npm run generate:types`：重新生成 `src/payload-types.ts`
- `npm run generate:importmap`：新增或改名后台自定义组件后重新生成 importMap
- `npm run decrypt-backup -- 备份文件 [输出文件]`：解密数据库备份
- `npm run import:legal`：把 `docs/隐私政策与Cookie说明模板（含巴西LGPD）.md` 里的隐私政策和 Cookie 说明录入“辅助页面”，自动填入公司名称、地址、网址和日期。默认存为草稿，加 `-- --publish` 直接发布；只操作本地 `file:` 数据库，导入线上库要另加 `-- --allow-remote`。运行结束会列出还没替换的方括号占位（如隐私邮箱、DPO、各服务商的保存期限），需与法务确认后在后台填写。脚本在 Next.js 之外运行，不能刷新线上已生成的页面，所以导入线上库时不要加 `--publish`：存为草稿，在后台填完占位后点“发布修改”，前台才会更新
- `npm run typecheck` / `npm run lint` / `npm test`：类型检查、代码检查、单元测试
- `patches/`：用 patch-package 给依赖打的补丁，安装依赖时由 `postinstall` 自动打上。目前包含 `@payloadcms/storage-vercel-blob` 3.91.0（上传前在浏览器里检查文件类型和大小，选了视频等不支持的文件立刻提示；上传失败时显示服务器返回的具体原因，原版只显示英文通用提示。类型和大小限制要和 `src/collections/Media.ts` 保持一致）、`@payloadcms/ui` 3.91.0（批量上传时直传失败记入错误数并弹出原因，原版吞掉错误会误报成功）和 `@payloadcms/next` 3.91.0（判断页面配置是否发布过时补上 `_status`，原版只要最新一版是草稿就误报“还没有发布过”）。升级这三个包时，补丁对不上会让安装报错，需要重新修改并运行 `npx patch-package <包名>`，或者确认新版已修复后删掉补丁。`vercel.json` 把安装命令设为 `npm ci`（每次部署先清空依赖再全新安装）：Vercel 默认沿用上次部署留下的依赖包，里面已经打过旧版补丁，改了补丁后新补丁会叠不上、安装直接失败

<a id="s3"></a>

## 三、环境变量

完整说明见 `.env.example`。线上的值只放在 Vercel 项目设置里，不进代码仓库。

- `DATABASE_URI`、`DATABASE_AUTH_TOKEN`：数据库地址和令牌。本地 `file:./dev.db`；线上 `libsql://…turso.io`
- `PAYLOAD_SECRET`：后台登录加密密钥
- `NEXT_PUBLIC_SITE_URL`：网站正式地址，不带结尾斜杠。用于 canonical、sitemap、邮件里的链接、后台实时预览、CSRF 白名单
- `BLOB_READ_WRITE_TOKEN`：媒体用的公开 Blob 存储令牌；不填时图片存到 `./media`
- `BACKUP_BLOB_READ_WRITE_TOKEN`、`BACKUP_ENCRYPTION_KEY`：备份用的私有 Blob 存储令牌和 64 位十六进制加密密钥（密钥另在线下保存一份，丢了就无法解密备份）
- `RESEND_API_KEY`、`MAIL_FROM`：发信；不填时只打印到控制台（生产环境只记收件人和主题，不打印正文）
- `CRON_SECRET`：定时任务调用密钥，Vercel Cron 会自动带上
- `PREVIEW_SECRET`：草稿预览密钥
- `IP_HASH_SECRET`：询盘 IP 哈希密钥，不填时由 `PAYLOAD_SECRET` 派生
- `TURNSTILE_SECRET_KEY`：Cloudflare 人机验证（预留，后台开启后才生效）
- `TOTP_DISABLED`：仅本地调试用

<a id="s4"></a>

## 四、目录结构

```text
src/
  app/(frontend)/      前台页面（首页、产品、案例、关于、联系、辅助页、404）
  app/(payload)/       Payload 后台路由和 /api/cms 接口（框架生成，一般不改）
  app/api/             网站自己的接口：询盘、表单令牌、预览、备份下载、定时任务
  admin/               后台自定义组件：仪表板提示、左侧菜单、参数表编辑器、前后台定位、搜索、内容导入导出、操作教程
  collections/         内容集合：产品、案例、辅助页面、媒体、询盘、用户、备份记录
  globals/             页面配置和全站设置：首页、关于、列表页、联系页、全站设置、主题、界面文案
  content/             前台默认英文文案（texts.ts）和文案字段工具
  components/          前台组件；client/ 下是需要浏览器交互的组件
  fields/ hooks/ access/   字段工具、发布检查与跳转等钩子、角色权限
  lib/                 数据读取、SEO、主题、参数表、定位、YouTube 等工具；server/ 下只在服务端使用
  migrations/          数据库迁移
  payload.config.ts    Payload 总配置
  proxy.ts             给后台请求加 x-pathname 头（payload-totp 需要）
scripts/               种子数据、备份解密、隐私政策与 Cookie 说明导入
tests/                 单元测试
docs/                  技术方案、界面文案、隐私政策模板、后台操作教程、业务方资料
```

<a id="s5"></a>

## 五、数据库与迁移

<a id="s5-1"></a>

### 5.1 本地与线上的差别

- 本地开发模式下，Payload 启动时会自动把字段定义同步到 `dev.db`，不需要跑迁移。
- 线上只用迁移：Vercel 的构建命令是 `npm run build:vercel`，先执行 `payload migrate` 再构建。
- 已核对过：用迁移建出来的库和开发模式自动同步出来的库，表、字段、默认值、索引完全一致。

<a id="s5-2"></a>

### 5.2 修改字段后的步骤

1. 改完集合或页面配置的字段后，运行 `npm run migrate:create -- 简短说明`，生成 `src/migrations/` 下的新迁移，连同代码一起提交。
2. 运行 `npm run generate:types` 更新类型；新增后台自定义组件时再运行 `npm run generate:importmap`。
3. 文案类字段的默认值要写成函数形式（`textFields` 已经这样处理）。Payload 生成迁移时会给每行 SQL 加缩进，多行的静态默认值（例如自动回复正文）的换行后面会多出空格。

<a id="s6"></a>

## 六、接口

以下是网站自己的接口。Payload 自带的接口在 `/api/cms` 下，对未登录访客关闭；只有本地没配 Blob 时，媒体接口对匿名开放，用来显示存在本地的图片。

<a id="s6-1"></a>

### 6.1 提交询盘

`POST /api/inquiries`，联系页、产品页、联系弹窗、离线留言四种表单共用，无需登录。

请求体：

```jsonc
{
  "source": "product_page",          // 表单来源：contact_page / product_page / popup / offline_message
  "name": "John Smith",              // 姓名，必填，最长 100
  "email": "john@example.com",       // 邮箱，必填，最长 200
  "country": "SA",                   // 国家 / 地区 ISO 代码；离线留言选填，其余必填
  "phone": "+966 50 123 4567",       // 电话或 WhatsApp，选填，最长 30
  "company": "Example Foods",        // 公司，选填，最长 150
  "productModel": "LTL-300",         // 产品或型号，选填，最长 150
  "requirements": "Need a 300 kg/h line", // 需求，必填，最长 5000
  "productId": 4,                    // 产品页表单带上产品 ID，系统按已发布产品保存名称和编号快照
  "formToken": "…",                  // 表单令牌，见 6.2；无效时按校验失败返回
  "turnstileToken": "",              // 人机验证令牌，后台开启 Turnstile 后才校验
  "website": "",                     // 防垃圾陷阱字段，正常访客为空；有值时假装成功但不保存
  "submissionId": "a1b2c3",          // 前端生成的提交编号，10 分钟内重复提交只保存一次
  "pageUrl": "https://…/products/latiao-production-line/", // 提交时所在页面
  "landingPage": "https://…/",       // 首次进入网站的落地页
  "referrer": "https://www.google.com/", // 来源网址
  "utm": { "source": "google", "medium": "cpc", "campaign": "brand", "term": "", "content": "" } // 广告参数
}
```

成功响应（201）：

```jsonc
{
  "ok": true,
  "inquiryRef": "INQ-20261021-0001", // 询盘编号；命中陷阱字段时为空字符串
  "redirect": "/thank-you/"          // 前端跳转地址
}
```

失败响应：

```jsonc
{
  "ok": false,
  "code": "VALIDATION_ERROR",        // VALIDATION_ERROR（400）/ RATE_LIMITED（429，同一 IP 每小时最多 5 条）/ SERVER_ERROR（500）
  "message": "Please check the highlighted fields.", // 显示在表单顶部的提示，来自后台“表单文案”
  "fields": { "email": "Please enter a valid email address." } // 只在校验失败时返回，各字段的错误提示
}
```

保存成功后并行发送询盘通知（发到全站设置里的通知邮箱）和客户确认邮件，每封最多等 5 秒；失败的交给之后的重发，不影响返回成功。返回响应后，接口还会顺手重发之前失败的邮件（不含本条，两种邮件各最多 3 封，最近 5 分钟内更新过的先跳过），因为免费版定时任务每天只跑一次。写入数据库失败时，把询盘内容直接发到通知邮箱，访客页面按失败处理。

<a id="s6-2"></a>

### 6.2 领取表单令牌

`GET /api/form-token`，无需登录。访客第一次聚焦表单时领取；页面是静态生成的，不能直接放令牌。

```jsonc
{
  "token": "eyJ0Ijox…",  // 签名令牌，提交询盘时原样带上
  "expiresIn": 7200      // 有效期（秒）；领取后 3 秒内就提交的询盘标记为“填写过快”，照常保存
}
```

<a id="s6-3"></a>

### 6.3 重发询盘邮件

`POST /api/inquiries/{id}/resend`，由后台询盘详情的“重新发送”按钮调用，需要管理员或业务人员登录并通过双重验证。

请求体：

```jsonc
{
  "target": "notify"  // notify：询盘通知；autoReply：客户确认邮件（可疑询盘不发）
}
```

响应：

```jsonc
{
  "ok": true,        // 是否发送成功
  "status": "sent",  // 发送后的状态：sent / failed
  "attempts": 2,     // 累计发送次数
  "error": null      // 失败原因
}
```

<a id="s6-4"></a>

### 6.4 草稿预览

`GET /api/preview`，由后台“预览”和实时预览调用，需要已登录后台。

```jsonc
{
  "secret": "***",                  // 必须等于 PREVIEW_SECRET
  "collection": "products",         // products / cases / pages，或页面配置名如 home-page
  "slug": "latiao-production-line"  // 记录的网址短名，页面配置不传
}
```

校验通过返回 307，开启草稿模式并跳转到对应页面；失败返回 401。`GET /api/exit-preview?path=/products/` 退出草稿模式并跳回站内路径。

<a id="s6-5"></a>

### 6.5 定时任务

由 `vercel.json` 配置，请求头必须带 `Authorization: Bearer {CRON_SECRET}`，否则返回 401。Vercel 免费版的定时任务每天只能运行一次，只保证在设定的那一小时内执行（时间为 UTC），所以合成两个任务，任务内部按顺序执行。

- `GET /api/cron/backup`：每天 02:00–02:59 之间，先导出数据库并加密保存，再增量备份新增的图片和 PDF（单次最多 500 个文件，没处理完的第二天继续）；数据库备份失败也照常备份媒体
- `GET /api/cron/maintenance`：每天 03:00–03:59 之间，先删除超过 365 天的询盘、超过 30 天的数据库备份、媒体被删除满 30 天后的备份文件，再重发发送失败的询盘邮件和超过 10 分钟仍是“待发送”的邮件（两种邮件各最多 50 封）；累计发送达到 10 次后不再自动重发；清理失败也照常重发

两个接口都是任一项失败时返回 500。备份任务的响应示例：

```jsonc
{
  "ok": true,                                   // 两项备份是否都成功
  "database": {                                 // 数据库备份；失败时只有 ok、file、error、durationMs
    "ok": true,
    "file": "backups/db/2026-10-21.sql.gz.enc", // 备份文件路径
    "sizeBytes": 46715,                         // 加密后的大小
    "tables": 75,                               // 导出的表数
    "rows": 672,                                // 导出的总行数
    "durationMs": 44                            // 耗时
  },
  "media": {                                    // 图片和 PDF 增量备份；失败时 ok 为 false 并带 error
    "ok": true,
    "copied": 3,                                // 本次复制的新文件数
    "copiedBytes": 524288,                      // 本次复制的字节数
    "remaining": 0,                             // 没处理完、留到第二天的文件数
    "durationMs": 1200                          // 耗时
    // 本地没配置 Blob 时多一个 skipped 字段说明原因，其余为 0
  }
}
```

维护任务的响应示例：

```jsonc
{
  "ok": true,                  // 两项是否都成功
  "cleanup": {                 // 过期数据清理；失败时只有 ok: false 和 error
    "ok": true,
    "deletedInquiries": 0,     // 删除的询盘数
    "deletedBackups": 0,       // 删除的数据库备份文件数
    "deletedMediaBackups": 0   // 删除的媒体备份文件数
  },
  "mail": {                    // 失败邮件重发；失败时只有 ok: false 和 error
    "ok": true,
    "retried": 1,              // 本次重发的邮件数
    "succeeded": 1,            // 重发成功数
    "gaveUp": 0                // 已达 10 次上限、不再自动重发的数量（后台仍可手动重发）
  }
}
```

<a id="s6-6"></a>

### 6.6 下载数据库备份

`GET /api/backups/{id}/download`，由后台“备份记录”的下载按钮调用，只有管理员可以下载，并且要通过双重验证。返回加密后的 `.sql.gz.enc` 文件。

<a id="s7"></a>

## 七、备份与恢复

- 每天导出全部表为 SQL，经 gzip 压缩后用 AES-256-GCM 加密，存到单独的私有 Blob 存储，保留 30 天。
- 恢复步骤：

```bash
npm run decrypt-backup -- 2026-10-21.sql.gz.enc restore.sql
```

```bash
sqlite3 restore.db < restore.sql
```

```bash
turso db import restore.db
```

- 已在本地验证：备份 → 解密 → 导入新库，完整性检查和外键检查通过，各表行数一致。
- 在测试站和正式站之间整体迁移内容，也用这套步骤：把来源环境的备份恢复成目标环境的数据库，再把来源 Blob 存储 `media/` 下的文件复制到目标 Blob 存储的同一路径。这样记录编号、关联和媒体引用都不变。后台“内容导入导出”里的产品、案例 JSON 导入只适合在同一个网站里按编号更新内容；媒体库不支持导入。

<a id="s8"></a>

## 八、测试与检查

- `npm test`：单元测试（参数表、询盘校验、表单令牌、文案回退、网址与链接、发布前中文检查、媒体引用查找、字段名称、自动回复格式、发信未配置、工艺步骤选中、客服对话统计、备份加密往返）
- `npm run lint`、`npm run typecheck`、`npm run build`：提交前都应通过

<a id="s9"></a>

## 九、部署注意事项

- Vercel 项目：Node.js 选 24.x，区域 `dub1`，安装命令 `npm ci`、构建命令 `npm run build:vercel`（都已写在 `vercel.json`）。
- 域名 `jetcomachinery.com` 在 Vercel 上配置，代码里不写死：项目的 Domains 里同时添加 `www.jetcomachinery.com` 和 `jetcomachinery.com`，按提示在域名解析里加记录；环境变量 `NEXT_PUBLIC_SITE_URL` 在 Production 环境填 `https://www.jetcomachinery.com`，改完要重新部署才生效。不带 www 的地址会自动 308 跳转到 www（`next.config.ts` 的 `hostRedirects`）。Preview 环境另填测试站的固定地址（如分支地址），不填时会回落到 `http://localhost:3000`，测试站后台的保存、上传等请求会被当成未登录。
- 按 Vercel 免费版（Hobby）配置：定时任务都是每天一次（改成更频繁的写法部署会报错）；防火墙每个项目只能建 1 条限流规则，询盘接口 `/api/inquiries` 和表单令牌接口 `/api/form-token` 共用这一条；没有密码保护，测试站用 Vercel 账号授权或共享链接限制访问。免费版条款限非商用，见技术方案 10.4 节。
- 测试环境（Vercel 预览地址）全站 noindex；正式环境在后台“全站设置 › 统计、收录与安全”勾选“允许搜索引擎收录”后才开放收录，主要页面内容录入完成前保持关闭。
- Resend 发件域名要先完成认证，否则只能发给 Resend 账号本人。
- 以后在 GTM 里新增广告或统计标签时，要把对应域名补进 `next.config.ts` 的前台内容安全策略。

<a id="s10"></a>

## 十、已知限制与未验证项

- 需要真实账号的部分还没有联调：Resend 实际发信、Vercel Blob 直传与图片优化、Turso、Vercel Cron、tawk.to 在线客服、GTM、Turnstile。本地均已按“未配置”分支验证（邮件打印到控制台、图片存本地、客服显示离线留言）。
- “没有编辑权限的账号不能从前台跳到后台”已实现（点选前先查当前账号对该内容的编辑权限），但只用管理员账号在浏览器里实测过，业务人员账号的拦截提示还没在浏览器里点过。
- 后台的“前后台定位”依赖 Payload 后台的懒渲染行为（折叠分组里的字段展开后才渲染）。已按 Payload 3.91.0 的 DOM 规则实现并实测了产品、案例、首页、关于页、界面文案，升级 Payload 后要回归测试这个功能。
- 手机端右侧悬浮栏改为默认收起成一个按钮、点开展开（`src/components/client/FloatingTools.tsx`），避免压住正文右侧。需求书要求手机端调整悬浮栏先确认效果，这一改动**待业务方确认**；如不采用，删掉样式里手机端的收起规则即可恢复常驻一列。
- 后台左侧菜单（`src/admin/components/Nav.tsx`）照 Payload 3.91.0 的默认菜单拼装，后台首页的集合卡片（`src/admin/components/DashboardCards.tsx`）用 Payload 自带的卡片组件生成后再重排，两处共用 `src/admin/navOrder.ts` 里的顺序；升级 Payload 后要回归检查这两处（卡片结构认不出来时会退回 Payload 默认顺序，不会报错）。编辑仪表板时仍能添加 Payload 自带的 Collections 卡片，那个是默认顺序。
- 后台“操作教程”页面运行时读取 `docs/后台操作教程.md`，已在 `next.config.ts` 用 `outputFileTracingIncludes` 带进部署包，部署后要打开 `/admin/guide` 确认一次。
