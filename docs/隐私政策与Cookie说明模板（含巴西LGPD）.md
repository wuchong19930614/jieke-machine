# 隐私政策与 Cookie 说明模板（含巴西 LGPD）

2026-10-20 · 依据：巴西《个人数据保护法》LGPD（Lei nº 13.709/2018）原文、巴西数据保护局 ANPD《Cookie 与个人数据保护指南》（2022 年 10 月发布，2025 年 1 月更新）、《机械设备独立站技术方案》

## 目录

- [一、使用说明](#u1)
    - [1.1 这份模板是什么](#u1-1)
    - [1.2 为什么要按巴西法律写](#u1-2)
    - [1.3 需要填写的占位符](#u1-3)
    - [1.4 上线前必须确认的事项](#u1-4)
    - [1.5 与技术方案的对应关系](#u1-5)
- [二、Privacy Policy（英文模板）](#u2)
- [三、Cookie Notice（英文模板）](#u3)
- [四、参考资料](#u4)

<a id="u1"></a>

## 一、使用说明

<a id="u1-1"></a>

### 1.1 这份模板是什么

- 第二、三部分分别是网站 Privacy Policy（隐私政策）和 Cookie Notice（Cookie 说明）的英文正文，直接填进后台“辅助页面”中对应的两页即可。
- 正文按 LGPD 的要求逐项写成，同时覆盖中东、南美、非洲其他国家常见的告知要求（告知用途、保留期限、共享对象、用户权利和联系方式）。其他国家的具体法律要求本模板**未逐一核实**。
- 方括号 `[ ]` 里是需要填写或确认的内容，发布前必须全部替换。
- 本模板不构成法律意见。网站面向巴西客户，建议上线前请熟悉 LGPD 的律师审核一遍。

<a id="u1-2"></a>

### 1.2 为什么要按巴西法律写

LGPD 第 3 条规定：只要处理活动的目的是向巴西境内的个人提供商品或服务，或者数据是在巴西境内收集的，不论公司设在哪个国家都适用。网站面向南美采购客户并接收巴西客户的询盘，因此适用 LGPD。

模板覆盖的 LGPD 要求：

| 条款 | 要求 | 模板对应位置 |
| --- | --- | --- |
| 第 7 条 | 处理个人数据须有法律依据 | Privacy Policy 第 4 节 |
| 第 9 条 | 告知用途、方式和期限、控制者身份和联系方式、共享对象和目的、处理者责任、用户权利 | Privacy Policy 第 1–8 节 |
| 第 9 条第 3 款 | 提供数据是获得服务的前提时，要显著告知 | Privacy Policy 第 4 节末尾 |
| 第 16 条 | 处理结束后删除数据 | Privacy Policy 第 5 节 |
| 第 18 条 | 9 项用户权利，以及向 ANPD 投诉、对基于合法利益的处理提出反对 | Privacy Policy 第 8 节 |
| 第 19 条 | 访问请求在 15 天内给出完整答复 | Privacy Policy 第 8 节 |
| 第 33 条 | 跨境传输须有法定依据 | Privacy Policy 第 7 节 |
| 第 41 条 | 公开数据保护负责人（encarregado）的身份和联系方式 | Privacy Policy 第 2 节 |
| 第 48 条 | 发生可能造成重大风险的安全事件时通知 ANPD 和当事人 | Privacy Policy 第 10 节 |

<a id="u1-3"></a>

### 1.3 需要填写的占位符

| 占位符 | 填什么 | 谁提供 |
| --- | --- | --- |
| [Company legal name] | 公司英文全称 | 业务方 |
| [Registered address] | 公司注册地址 | 业务方 |
| [Country] | 公司所在国家（如 China） | 业务方 |
| [www.example.com] | 正式域名 | 项目方与业务方确定 |
| [privacy@example.com] | 接收隐私请求的邮箱，建议用公司域名邮箱 | 业务方 |
| [DPO name] | 数据保护负责人姓名或岗位名称 | 业务方 |
| [Inbox retention] | 询盘通知邮件在业务邮箱里保留多久 | 业务方 |
| [Chat retention] | tawk.to 后台设置的会话保留期限 | 业务方 |
| [YYYY-MM-DD] | 发布或更新日期 | 发布时填写 |

<a id="u1-4"></a>

### 1.4 上线前必须确认的事项

1. **数据保护负责人**：LGPD 第 41 条要求公开负责人的身份和联系方式。ANPD 第 2/2022 号决议允许小型主体不指定负责人、只提供联系渠道，但这一豁免是否适用于境外公司**未确认**。建议直接指定一个负责人，并提供 [privacy@example.com] 邮箱。
2. **跨境传输**：巴西客户的数据会存到巴西境外的服务器（Vercel、Turso、Resend、tawk.to、Google）。按 ANPD 第 19/2024 号决议，2025 年 8 月 23 日之后，以合同条款作为跨境传输依据时，必须采用 ANPD 的标准合同条款。这些服务商的数据处理协议是否已纳入 ANPD 标准条款**未确认**，上线前需逐一查看各家的数据处理协议（DPA）；确认后再调整 Privacy Policy 第 7 节的表述。
3. **葡萄牙语版本**：ANPD 指南把“Cookie 政策只提供外语版本”列为应当避免的做法。网站只做英文，但建议 Privacy Policy 和 Cookie Notice 这两页另外提供葡萄牙语版本。
4. **GA4 设置**：本模板按“分析类 Cookie 以合法利益为依据、首期不弹同意横幅”编写（理由见技术方案 7.3 节）。前提是 GA4 中关闭 Google 信号和广告个性化，不与广告工具共享数据，并把数据保留期设为 14 个月。
5. **以后开启广告再营销时**：需要改为同意横幅。第一层提供“拒绝非必要 Cookie”按钮，广告类 Cookie 默认关闭，同时更新 Cookie Notice。

<a id="u1-5"></a>

### 1.5 与技术方案的对应关系

| 模板内容 | 技术方案依据 |
| --- | --- |
| 收集的数据：姓名、邮箱、国家、电话或 WhatsApp、公司、产品或型号、需求内容 | 3.7 节询盘字段 |
| 自动收集：提交页面、落地页、来源网站、广告参数、浏览器信息、IP 哈希值 | 3.7 节访问来源和系统字段 |
| 询盘保留 12 个月后自动删除，删除后最多在加密备份中再保留 30 天 | 3.7 节、9.2 节 |
| 服务商：Vercel、Turso、Resend、tawk.to、Google | 1.2 节技术选型 |
| 安全措施：HTTPS、双重验证、加密备份 | 9.1 节、9.2 节 |
| 分析类 Cookie 可在 Cookie Settings 中关闭 | 7.3 节 |

<a id="u2"></a>

## 二、Privacy Policy（英文模板）

```markdown
# Privacy Policy

Last updated: [YYYY-MM-DD]

## 1. Who we are

[Company legal name] ("we", "us", "our") operates the website [www.example.com] (the "Website"). We are the controller of the personal data described in this Privacy Policy.

- Address: [Registered address]
- Email: [privacy@example.com]

## 2. Data protection contact

If you have questions about this Privacy Policy or about your personal data, you can contact our data protection officer (encarregado):

- Name: [DPO name]
- Email: [privacy@example.com]

## 3. Personal data we collect

**Information you give us**

When you submit an inquiry through our contact page, a product page or our contact pop-up, or when you leave an offline message in our live chat, we collect:

- your name and email address;
- your country or region;
- your phone or WhatsApp number (optional);
- your company name (optional);
- the product or model you are interested in;
- the content of your message.

When you chat with us, we receive the messages and any files you send through our live chat service.

**Information collected automatically**

When you submit a form, we also record the page you submitted it from, the first page you visited on the Website, the website that referred you, the campaign parameters contained in the link you clicked (UTM parameters), your browser type, and a one-way hashed version of your IP address that we use only to prevent spam. We do not store your full IP address with your inquiry.

We also use analytics cookies to measure how the Website is used. See our Cookie Notice for details.

We do not intend to collect sensitive personal data. Please do not include such data in your messages.

## 4. How we use your data and our legal bases

| Purpose | Data used | Legal basis (LGPD) |
| --- | --- | --- |
| Responding to your inquiry, preparing quotations and equipment proposals, and following up on your request | Contact details and message | Steps prior to a contract, taken at your request (Art. 7, V) |
| Sending an automatic email confirming that we received your inquiry | Name and email address | Steps prior to a contract, taken at your request (Art. 7, V) |
| Preventing spam and abuse and keeping the Website secure | Hashed IP address, browser type, submission timing | Our legitimate interest (Art. 7, IX) |
| Measuring the Website's audience with aggregated statistics | Analytics cookie data | Our legitimate interest (Art. 7, IX) |
| Establishing, exercising or defending legal claims | Relevant records | Regular exercise of rights (Art. 7, VI) |

Your name, email address, country and message are necessary for us to reply to your inquiry. If you do not provide them, we will not be able to respond.

## 5. How long we keep your data

- **Inquiries and offline messages:** kept for 12 months from the date of submission and then deleted automatically from our website database. Deleted records may remain in our encrypted backups for up to 30 additional days, until those backups are deleted.
- **Inquiry notifications in our business email inbox:** [Inbox retention].
- **Live chat conversations:** kept by our live chat provider for [Chat retention].
- **Analytics data:** kept for 14 months.

We may keep data for longer only where this is required to comply with a legal obligation or to establish, exercise or defend legal claims.

## 6. Who we share your data with

We do not sell your personal data. We share it only with the following service providers, which process it on our behalf and under our instructions:

| Provider | Purpose |
| --- | --- |
| Vercel | Website hosting, file storage and encrypted backups |
| Turso | Website database |
| Resend | Sending inquiry notifications and confirmation emails |
| tawk.to | Live chat |
| Google | Website analytics (Google Analytics, Google Tag Manager) and embedded videos (YouTube) |

We may also disclose personal data where required by law or by a competent authority.

## 7. International data transfers

We are located in [Country], and our service providers store and process data in the European Union, the United States and other countries. Your personal data may therefore be transferred outside Brazil and outside your country of residence. When we transfer personal data internationally, we rely on safeguards permitted by Article 33 of the LGPD, such as contractual clauses in our agreements with service providers. [Confirm the transfer mechanism for each provider before publishing.]

## 8. Your rights

Under Article 18 of the LGPD, you may at any time request:

1. confirmation that we process your personal data;
2. access to your personal data;
3. correction of incomplete, inaccurate or outdated data;
4. anonymization, blocking or deletion of data that is unnecessary, excessive or processed in breach of the LGPD;
5. portability of your data to another service or product provider;
6. deletion of personal data processed on the basis of your consent;
7. information about the public and private entities with which we have shared your data;
8. information about the possibility of not giving consent and the consequences of refusing;
9. withdrawal of your consent.

You may also object to processing based on our legitimate interest, and you have the right to file a complaint with Brazil's National Data Protection Authority (ANPD).

To exercise your rights, email [privacy@example.com]. We will answer requests for access to your data within 15 days and will handle other requests as soon as possible. We may ask you to confirm your identity before acting on a request. If you live outside Brazil, you can also contact us, and we will handle your request in accordance with the law that applies to you.

## 9. Cookies

We use cookies as described in our [Cookie Notice](/cookie-notice/). You can switch off analytics cookies at any time through the "Cookie Settings" link at the bottom of every page.

## 10. Security

We protect personal data with HTTPS encryption, access restricted to authorized staff using two-factor authentication, and encrypted backups. If a security incident may cause relevant risk or damage to you, we will notify the ANPD and the affected individuals as required by law.

## 11. Children

The Website is intended for business customers and is not directed to children. We do not knowingly collect personal data from children.

## 12. Changes to this Privacy Policy

We may update this Privacy Policy from time to time. The "Last updated" date at the top shows when it was last changed.

## 13. Contact us

[Company legal name]
[Registered address]
[privacy@example.com]
```

<a id="u3"></a>

## 三、Cookie Notice（英文模板）

```markdown
# Cookie Notice

Last updated: [YYYY-MM-DD]

## 1. What cookies are

Cookies are small text files that a website stores in your browser. Some are needed for features you request, and others help us understand how the website is used.

## 2. Cookies we use

| Category | Provider | Purpose | Duration | Legal basis (LGPD) |
| --- | --- | --- | --- | --- |
| Strictly necessary | [www.example.com] | Remembers your cookie choices | 12 months | Our legitimate interest |
| Analytics | Google Analytics (_ga, _ga_[ID]) | Counts visits and shows how pages are used, as aggregated statistics. Google signals and ad personalization are switched off. | Up to 2 years | Our legitimate interest. You can switch these cookies off at any time in Cookie Settings. |
| Live chat | tawk.to | Set only when you open the live chat, to keep your conversation running | [As set by tawk.to] | Our legitimate interest in providing the chat you requested |
| Video | YouTube (privacy-enhanced mode) | Set only when you click play on a video | [As set by YouTube] | Our legitimate interest in playing the video you requested |

We do not use advertising cookies. If we add them in the future, we will ask for your consent before setting them, and you will be able to refuse.

## 3. How to manage cookies

- **Cookie Settings:** use the "Cookie Settings" link at the bottom of every page to switch analytics cookies off or on.
- **Your browser:** you can block or delete cookies in your browser settings. Blocking all cookies may stop the live chat and videos from working.

## 4. Contact us

If you have questions about our use of cookies, email [privacy@example.com]. More information about how we handle personal data is available in our [Privacy Policy](/privacy-policy/).
```

<a id="u4"></a>

## 四、参考资料

查询日期 2026-10-20。

已打开核对的原文：

- [LGPD 法律原文（巴西总统府官网）](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)：第 3、7、9、16、18、19、33、41 条
- [ANPD《Cookie 与个人数据保护指南》](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf)：第 24–26 页（分析类 Cookie 可以合法利益为依据），第 30–33 页（横幅建议做法和应避免的做法）

只看过搜索摘要、需进一步核实的资料：

- [ANPD 第 19/2024 号决议（标准合同条款）的过渡期说明](https://lefosse.com/noticias/transferencia-internacional-de-dados-prazo-para-adocao-das-clausulas-padrao-da-anpd-se-encerra-em-23-de-agosto/)
- [ANPD 第 2/2022 号决议（小型主体）解读](https://www.felsberg.com.br/no-dia-internacional-da-protecao-de-dados-anpd-publica-nova-resolucao-que-regulamenta-a-aplicacao-da-lgpd-para-agentes-de-tratamento-de-pequeno-porte/)
