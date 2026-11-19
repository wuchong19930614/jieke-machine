// 前台固定文案的定义与默认值，英文取自 docs/前台英文界面文案.md
// 每项为 [后台中文名称, 默认英文, 选项]；后台留空时前台用默认英文
import type { TextDefs } from './defineTexts'

// ---------- 全站设置 ----------

export const NAV_TEXTS = {
  home: ['导航第 1 项', 'Home'],
  about: ['导航第 2 项', 'About Us'],
  products: ['导航第 3 项', 'Products'],
  cases: ['导航第 4 项', 'Case Studies'],
  contact: ['导航第 5 项', 'Contact Us'],
} as const satisfies TextDefs

export const FLOATING_TEXTS = {
  region: ['悬浮栏区域朗读名', 'Quick contact'],
  email: ['按钮 1（邮箱）', 'Email Us'],
  phone: ['按钮 2（电话）', 'Call Us'],
  contact: ['按钮 3（联系我们）', 'Contact Us'],
  chat: ['按钮 4（在线客服）', 'Online Service'],
  top: ['按钮 5（返回顶部）', 'Back to Top'],
  blue: ['按钮 6（在线沟通）', 'Chat with Us'],
  expand: ['手机：展开按钮朗读', 'Show contact options', { hint: '手机上六个按钮收起成一个，点开后展开' }],
  collapse: ['手机：收起按钮朗读', 'Hide contact options'],
} as const satisfies TextDefs

export const CONTACT_BAND_TEXTS = {
  title: ['标题', 'Discuss Your Production Requirements', { hideable: true }],
  text: ['说明', 'Get the right equipment configuration for your project.', { hideable: true }],
  buttonText: ['按钮', 'Get a Quote →', { hideable: true }],
} as const satisfies TextDefs

export const FORM_TEXTS = {
  requiredNote: ['必填说明', 'Fields marked * are required.'],
  nameLabel: ['姓名：字段名', 'Name *'],
  namePlaceholder: ['姓名：占位', 'Your full name'],
  emailLabel: ['邮箱：字段名', 'Email *'],
  emailPlaceholder: ['邮箱：占位', 'name@company.com'],
  countryLabel: ['国家：字段名', 'Country / Region *'],
  countryOptionalLabel: ['国家：离线留言字段名', 'Country / Region (optional)'],
  countryPlaceholder: ['国家：下拉首项', 'Select your country / region'],
  phoneLabel: ['电话：字段名', 'Phone / WhatsApp'],
  phonePlaceholder: ['电话：占位', 'Include country code, e.g. +966 50 123 4567'],
  companyLabel: ['公司：字段名', 'Company'],
  companyPlaceholder: ['公司：占位', 'Company name'],
  productLabel: ['产品/型号：字段名', 'Product / Model'],
  productPlaceholder: ['产品/型号：占位（联系页）', 'Product name or model number'],
  productPagePlaceholder: ['产品/型号：占位（产品页）', 'Model or capacity, if known'],
  productPrefill: ['产品页自动带入提示', 'Product: {productName}'],
  requirementsLabel: ['需求：字段名', 'Your Requirements *'],
  requirementsPlaceholder: [
    '需求：占位',
    'Tell us the equipment you need, your raw material and target capacity (kg/h).',
  ],
  privacyNote: ['隐私说明', 'By submitting, you agree to our Privacy Policy.'],
  privacyLinkText: ['隐私说明中的链接文字', 'Privacy Policy', { hint: '隐私说明里与这几个字相同的部分会变成链接' }],
  submitInquiry: ['提交按钮（联系页、产品页、弹窗）', 'Send Inquiry'],
  submitMessage: ['提交按钮（离线留言）', 'Send Message'],
  sending: ['提交中按钮', 'Sending…'],
  errorSummary: ['校验失败总提示', 'Please check the highlighted fields.'],
  errNameRequired: ['姓名为空', 'Please enter your name.'],
  errNameTooLong: ['姓名超长', 'Name must be 100 characters or fewer.'],
  errEmailRequired: ['邮箱为空', 'Please enter your email address.'],
  errEmailInvalid: ['邮箱格式错误', 'Please enter a valid email address.'],
  errCountryRequired: ['国家未选', 'Please select your country or region.'],
  errPhoneTooLong: ['电话超长', 'Phone / WhatsApp number must be 30 characters or fewer.'],
  errCompanyTooLong: ['公司超长', 'Company name must be 150 characters or fewer.'],
  errProductTooLong: ['产品/型号超长', 'Product / Model must be 150 characters or fewer.'],
  errRequirementsRequired: ['需求为空', 'Please tell us about your requirements.'],
  errRequirementsTooLong: ['需求超长', 'Your requirements must be 5,000 characters or fewer.'],
  errRateLimited: [
    '提交太频繁',
    "You've sent several inquiries in a short time. Please try again later, or email us at {businessEmail}.",
  ],
  errServer: [
    '服务器错误',
    "Sorry, we couldn't send your inquiry. Please try again, or email us at {businessEmail}.",
  ],
  errNetwork: [
    '网络失败',
    'Connection problem. Please check your internet connection and try again. Your details are still in the form.',
  ],
  captchaPrompt: ['人机验证提示（预留）', 'Please complete the security check.'],
  captchaFailed: ['人机验证失败（预留）', 'Security check failed. Please refresh the page and try again.'],
  honeypotLabel: ['隐藏陷阱字段的标签', 'Leave this field blank'],
} as const satisfies TextDefs

export const RED_PANEL_TEXTS = {
  title: ['标题栏标题', 'Online Service'],
  welcome: ['欢迎语', 'Welcome! Tell us about the equipment you need.'],
  connecting: ['连接中', 'Connecting…'],
  onlineStatus: ['在线：状态', "We're online"],
  onlineText: ['在线：说明', 'Our team is online and ready to help.'],
  startChat: ['在线：按钮', 'Start Chat'],
  opening: ['在线：点击后打开前', 'Opening chat…'],
  chatPrivacy: ['在线：隐私说明', 'By starting a chat, you agree to our Privacy Policy.'],
  offlineStatus: ['离线：状态', "We're offline"],
  offlineText: ['离线：说明', "Our team is offline right now. Leave a message and we'll reply by email."],
  failedText: ['连接失败：说明', "We couldn't connect to live chat. Please leave a message and we'll reply by email."],
  formTitle: ['离线留言表单标题', 'Leave a Message'],
} as const satisfies TextDefs

export const BLUE_PANEL_TEXTS = {
  ariaLabel: ['面板朗读名', 'Live chat'],
  closeLabel: ['关闭按钮朗读', 'Close chat'],
  welcome: ['欢迎语', "👋 Hi there! We're here to help."],
  enterChat: ['进入按钮', 'Enter Chat'],
  connecting: ['进入按钮连接中', 'Connecting…'],
  privacy: ['隐私说明', 'By starting a chat, you agree to our Privacy Policy.'],
  failedText: ['连接失败说明', "We couldn't connect to live chat. Please try again, or send us an inquiry."],
  failedButton: ['连接失败按钮', 'Send an Inquiry'],
} as const satisfies TextDefs

export const WHATSAPP_TEXTS = {
  message: [
    '预填消息（通用）',
    "Hello, I'm interested in your food processing machinery. Could you send me more information?",
  ],
  productMessage: [
    '预填消息（产品页）',
    "Hello, I'm interested in your {productName}. Could you send me more information?",
  ],
} as const satisfies TextDefs

export const AUTO_REPLY_TEXTS = {
  subject: ['自动回复：邮件主题', "We've received your inquiry – {companyName}"],
  preheader: ['自动回复：预览文字', 'Thank you for contacting us. Our team will reply soon.'],
  body: [
    '自动回复：正文',
    [
      'Hi {name},',
      '',
      'Thank you for contacting {companyName}. We have received your inquiry{aboutProduct}, and our team will review your requirements and reply to you as soon as possible.',
      '',
      "If you'd like to add more details, such as your raw material, target capacity (kg/h), power supply (voltage / frequency) or installation site, simply reply to this email.",
      '',
      'Best regards,',
      'The {companyName} Team',
      '',
      'Email: {businessEmail}',
      'Phone: {phone}',
      'WhatsApp: {whatsapp}',
      '{websiteUrl}',
      '',
      '---',
      "You're receiving this email because this address was used to submit an inquiry on {websiteUrl}. If you didn't submit it, you can ignore this email.",
      'Privacy Policy: {websiteUrl}/privacy-policy/',
    ].join('\n'),
    { textarea: true, hint: '含变量的行如果变量为空，整行不发送；不要加入客户填写的需求内容' },
  ],
} as const satisfies TextDefs

export const SEO_TEXTS = {
  titleTemplate: ['标题模板', '{title} | {companyName}', { hint: '{title} 为页面名' }],
  homeTitle: ['首页标题', '{companyName} – Food Processing Machinery & Production Lines'],
  defaultDescription: ['默认描述', '', { textarea: true }],
} as const satisfies TextDefs

// ---------- 界面文案（ui-texts） ----------

export const UI_COMMON = {
  skipToContent: ['跳到正文链接', 'Skip to main content'],
  menuOpen: ['菜单按钮朗读（收起时）', 'Open menu'],
  menuClose: ['菜单按钮朗读（展开时）', 'Close menu'],
  menu: ['菜单按钮', 'Menu'],
  mainNav: ['导航区域朗读名', 'Main navigation'],
  logoAlt: ['Logo 朗读', '{companyName} – Home'],
  breadcrumb: ['面包屑区域朗读名', 'Breadcrumb'],
  opensNewTab: ['新窗口提示（隐藏文字）', '(opens in a new tab)'],
  close: ['关闭按钮朗读', 'Close'],
  playVideo: ['视频播放按钮朗读', 'Play video: {videoTitle}'],
  playVideoGeneric: ['视频播放按钮朗读（无标题）', 'Play video'],
  videoError: ['视频播放失败提示', "This video can't be played right now."],
  watchOnYouTube: ['视频播放失败链接', 'Watch on YouTube'],
  contactUs: ['视频播放失败按钮', 'Contact Us'],
  clickToEnlarge: ['图片放大提示', 'Click to enlarge'],
  prevImage: ['放大层上一张', 'Previous image'],
  nextImage: ['放大层下一张', 'Next image'],
  imageCount: ['放大层计数', '{n} / {total}'],
  emailTitle: ['邮箱弹层标题', 'Email'],
  phoneTitle: ['电话弹层标题', 'Phone'],
  sendEmail: ['邮箱弹层按钮', 'Send Email'],
  callNow: ['电话弹层按钮', 'Call Now'],
  copy: ['复制按钮', 'Copy'],
  copied: ['复制成功提示', 'Copied'],
  copyFailed: ['复制失败提示', 'Copy failed', { hint: '浏览器不允许复制时显示，同时选中文字方便访客手动复制' }],
  whatsappAria: ['WhatsApp 链接朗读', 'Chat on WhatsApp (opens in a new tab)'],
  home: ['面包屑首页', 'Home'],
} as const satisfies TextDefs

export const UI_TOPBAR = {
  tagline: ['顶栏左侧标语', 'FOOD PROCESSING MACHINERY', { hideable: true }],
  email: ['顶栏邮箱', 'Email: {businessEmail}'],
  whatsapp: ['顶栏 WhatsApp', 'WhatsApp: {whatsapp}'],
} as const satisfies TextDefs

export const UI_FOOTER = {
  quickLinks: ['导航栏目标题', 'Quick Links'],
  contact: ['联系栏目标题', 'Contact'],
  email: ['邮箱', 'Email: {businessEmail}'],
  phone: ['电话', 'Phone: {phone}'],
  whatsapp: ['WhatsApp', 'WhatsApp: {whatsapp}'],
  address: ['地址', 'Address: {address}'],
  followUs: ['社交媒体栏目标题', 'Follow Us'],
  privacyPolicy: ['法律链接 1', 'Privacy Policy'],
  cookieNotice: ['法律链接 2', 'Cookie Notice'],
  cookieSettings: ['法律链接 3', 'Cookie Settings'],
  copyright: ['版权行', '© {year} {companyName}. All rights reserved.'],
} as const satisfies TextDefs

export const UI_MOBILE = {
  quote: ['底部按钮 1', 'Get a Quote'],
  whatsapp: ['底部按钮 2', 'WhatsApp'],
} as const satisfies TextDefs

export const UI_BANNER = {
  kickerDefault: ['小标题默认值', 'FOOD PROCESSING MACHINERY'],
  quoteButton: ['报价按钮默认值', 'Get a Quote'],
  productButton: ['产品按钮默认值', 'View Details →'],
  prev: ['上一张按钮朗读', 'Previous slide'],
  next: ['下一张按钮朗读', 'Next slide'],
  region: ['轮播区域朗读名', 'Featured production lines'],
  slide: ['每张幻灯片朗读', 'Slide {n} of {total}'],
  controls: ['控制区朗读名', 'Slideshow controls'],
  goTo: ['圆点朗读', 'Go to slide {n}'],
  count: ['计数', '{n} / {total}'],
  pause: ['暂停按钮文字', 'Pause'],
  play: ['播放按钮文字', 'Play'],
  pauseAria: ['暂停按钮朗读', 'Pause slideshow'],
  playAria: ['播放按钮朗读', 'Play slideshow'],
} as const satisfies TextDefs

export const UI_PRODUCT_LIST = {
  viewDetails: ['卡片按钮', 'View Details →', { hideable: true }],
  emptyText: [
    '无已发布产品时的提示',
    'Our product information is being updated. Please contact us for details on our production lines.',
  ],
  emptyButton: ['提示下方按钮', 'Contact Us →'],
} as const satisfies TextDefs

// 产品详情 14 个模块的默认标题和按钮；每条产品可在“模块文案覆盖”里改
export const UI_PRODUCT = {
  heroKicker: ['横幅小标题默认值', 'PRODUCTION LINE SOLUTION', { hideable: true }],
  heroButton: ['横幅按钮', 'Get a Quote →', { hideable: true }],
  brochureButton: ['手册下载按钮', 'Download Brochure'],
  brochureMeta: ['手册文件说明', 'PDF · {fileSize}'],
  applicationsTitle: ['可生产成品：标题', 'Products You Can Make', { hideable: true }],
  applicationsSubtitle: ['可生产成品：副标题', ''],
  applicationsAria: ['可生产成品：区域朗读名', 'Finished products'],
  introKicker: ['图文介绍：小标题', 'PRODUCTION LINE OVERVIEW', { hideable: true }],
  introTitle: ['图文介绍：标题', 'Product Introduction', { hideable: true }],
  featuresTitle: ['设备特点：标题', 'Equipment Features', { hideable: true }],
  proposalTitle: ['报价入口：标题', 'Discuss Your Production Line Configuration', { hideable: true }],
  proposalButton: ['报价入口：按钮', 'Get a Quote →', { hideable: true }],
  processTitle: ['工艺流程：标题', 'Production Process', { hideable: true }],
  specsTitle: ['参数表：标题', 'Technical Specifications', { hideable: true }],
  specsModel: ['参数表：表头第一格', 'Model'],
  specsSwipe: ['参数表：手机横滑提示', 'Swipe to see all models →'],
  specsEmpty: ['参数表：空单元格', '—'],
  audienceTitle: ['适用客户：标题', 'Who This Line Is For', { hideable: true }],
  supportTitle: ['项目支持：标题', 'Project Support', { hideable: true }],
  faqTitle: ['FAQ：标题', 'Frequently Asked Questions', { hideable: true }],
  videoTitle: ['运行视频：标题', 'Production Line Video', { hideable: true }],
  advantagesTitle: ['设备优势：标题', 'Equipment Advantages', { hideable: true }],
  advantagesSubtitle: ['设备优势：副标题', ''],
  stepsKicker: ['工艺步骤：小标题', 'STEP BY STEP', { hideable: true }],
  stepsTitle: ['工艺步骤：标题', 'Step-by-Step Process', { hideable: true }],
  stepsSubtitle: ['工艺步骤：副标题', ''],
  stepsAria: ['工艺步骤：列表朗读名', 'Production steps'],
  stepAria: ['工艺步骤：按钮朗读', 'Step {n}: {stepTitle}'],
  relatedTitle: ['相关生产线：标题', 'Related Production Lines', { hideable: true }],
  relatedSubtitle: ['相关生产线：副标题', ''],
  relatedButton: ['相关生产线：卡片按钮', 'View Details →', { hideable: true }],
  casesTitle: ['客户案例：标题', 'Customer Stories & Project Cases', { hideable: true }],
  casesSubtitle: ['客户案例：副标题', ''],
  casesButton: ['客户案例：卡片按钮', 'View Case →', { hideable: true }],
  inquiryKicker: ['询盘区：小标题', 'CONTACT OUR TEAM', { hideable: true }],
  inquiryTitle: ['询盘区：标题', 'Request a Quote & Equipment Proposal', { hideable: true }],
  inquiryIntro: ['询盘区：说明', 'Tell us about your production requirements.', { hideable: true }],
} as const satisfies TextDefs

export const UI_CASE_LIST = {
  countryLabel: ['卡片国家标签', 'Country'],
  equipmentLabel: ['卡片设备标签', 'Equipment'],
  viewCase: ['卡片链接', 'View Case →', { hideable: true }],
  pagination: ['分页区域朗读名', 'Pagination'],
  previous: ['上一页', 'Previous'],
  next: ['下一页', 'Next'],
  pageAria: ['页码朗读', 'Page {n}'],
  pageOf: ['页码说明', 'Page {n} of {total}'],
  emptyText: [
    '无已发布案例时的提示',
    'Case studies will be published here soon. In the meantime, contact us to discuss your project.',
  ],
  emptyButton: ['提示下方按钮', 'Contact Us →'],
} as const satisfies TextDefs

export const UI_CASE_DETAIL = {
  back: ['返回链接', '← Back to Case Studies', { hideable: true }],
  overviewTitle: ['项目概况：标题', 'Project Overview', { hideable: true }],
  customer: ['行：客户', 'Customer'],
  country: ['行：国家 / 地区', 'Country / Region'],
  configuration: ['行：设备配置', 'Equipment Configuration'],
  capacity: ['行：产能', 'Capacity (kg/h)'],
  deliveryDate: ['行：交付日期', 'Delivery Date'],
  requirements: ['正文小节 1', 'Customer Requirements', { hideable: true }],
  solution: ['正文小节 2', 'Equipment Solution', { hideable: true }],
  delivery: ['正文小节 3', 'Delivery & Operation', { hideable: true }],
  photos: ['现场图片标题', 'Project Photos', { hideable: true }],
  video: ['视频标题', 'Project Video', { hideable: true }],
  linesUsed: ['所用生产线标题', 'Production Lines Used', { hideable: true }],
  linesButton: ['所用生产线链接', 'View Details →', { hideable: true }],
  primaryButton: ['主按钮', 'Discuss a Similar Project →', { hideable: true }],
  secondaryButton: ['次按钮', 'Explore Products', { hideable: true }],
} as const satisfies TextDefs

export const UI_COOKIE = {
  title: ['弹窗标题', 'Cookie Settings'],
  intro: [
    '说明',
    "We use cookies to make this website work and to understand how it is used. You can switch off analytics cookies at any time. This won't affect your ability to browse the site or send us an inquiry.",
    { textarea: true },
  ],
  necessaryTitle: ['类别 1：标题', 'Strictly Necessary Cookies'],
  necessaryStatus: ['类别 1：状态', 'Always on'],
  necessaryText: [
    '类别 1：说明',
    "Needed for the website to work, for example to remember your cookie settings. They can't be switched off.",
    { textarea: true },
  ],
  analyticsTitle: ['类别 2：标题', 'Analytics Cookies'],
  analyticsToggle: ['类别 2：开关朗读', 'Allow analytics cookies'],
  analyticsText: [
    '类别 2：说明',
    'Help us count visits and see how pages are used, as aggregated statistics. Google signals and ad personalization are switched off.',
    { textarea: true },
  ],
  on: ['开关：开', 'On'],
  off: ['开关：关', 'Off'],
  chatTitle: ['类别 3：标题', 'Live Chat and Video'],
  chatStatus: ['类别 3：状态', 'Only when you use them'],
  chatText: [
    '类别 3：说明',
    'Our live chat (tawk.to) and YouTube videos set cookies only when you open the chat or play a video.',
    { textarea: true },
  ],
  noticeLink: ['说明链接', 'Read our Cookie Notice'],
  save: ['保存按钮', 'Save Settings'],
  cancel: ['取消按钮', 'Cancel'],
  saved: ['保存成功提示', 'Your cookie settings have been saved.'],
} as const satisfies TextDefs

export const UI_THANK_YOU = {
  kicker: ['小标题', 'INQUIRY RECEIVED', { hideable: true }],
  confirmation: [
    '确认邮件提示',
    "You'll receive a confirmation email shortly. If you can't find it, please check your spam or junk folder.",
  ],
  whatsappHint: ['WhatsApp 引导', 'Need a faster response? Chat with us on WhatsApp.', { hideable: true }],
  whatsappButton: ['WhatsApp 按钮', 'Chat on WhatsApp'],
  backHome: ['按钮 1', 'Back to Home', { hideable: true }],
  exploreProducts: ['按钮 2', 'Explore Products', { hideable: true }],
} as const satisfies TextDefs

export const UI_NOT_FOUND = {
  code: ['大号数字', '404'],
  backHome: ['按钮 1', 'Back to Home', { hideable: true }],
  exploreProducts: ['按钮 2', 'Explore Products', { hideable: true }],
  contactUs: ['按钮 3', 'Contact Us', { hideable: true }],
} as const satisfies TextDefs

export const UI_ERROR = {
  title: ['主标题', 'Something Went Wrong'],
  text: ['正文', 'Sorry, something went wrong on our side. Please refresh the page or try again later.'],
  retry: ['按钮 1', 'Try Again'],
  backHome: ['按钮 2', 'Back to Home'],
} as const satisfies TextDefs

export const UI_PAGE_TITLES = {
  casesPaged: ['案例列表第 n 页的页面名', 'Case Studies – Page {n}'],
} as const satisfies TextDefs

// ---------- 各页面配置里的模块文案 ----------

export const HOME_SERVICES_TEXTS = {
  title: ['模块标题', 'Solutions for Your Requirements', { hideable: true }],
  subtitle: ['模块副标题', ''],
} as const satisfies TextDefs

export const HOME_STATS_TEXTS = {
  supplierLabel: ['左侧身份标签', 'Food Processing Machinery Supplier', { hint: '如是生产厂家，改为 Food Processing Machinery Manufacturer', hideable: true }],
} as const satisfies TextDefs

export const HOME_ABOUT_TEXTS = {
  kicker: ['小标题', 'ABOUT US', { hideable: true }],
  title: ['标题', 'Who We Are', { hideable: true }],
  companyTitle: ['公司名标题', '{companyName}', { hint: '{companyName} 自动替换为全站设置里的公司名', hideable: true }],
  buttonText: ['按钮', 'Learn More About Us →', { hideable: true }],
} as const satisfies TextDefs

export const HOME_FACTORY_TEXTS = {
  kicker: ['小标题', 'OUR FACILITIES', { hideable: true }],
  title: ['标题', 'Factory & Workshop', { hideable: true }],
  subtitle: ['副标题', ''],
} as const satisfies TextDefs

export const HOME_LINES_TEXTS = {
  title: ['模块标题', 'Our Production Lines', { hideable: true }],
  subtitle: ['模块说明', 'Explore equipment by the type of food you process.', { hideable: true }],
  buttonText: ['卡片按钮', 'View Details →', { hideable: true }],
  inquiryButton: ['下方咨询按钮', 'Discuss Your Project ↗', { hideable: true }],
} as const satisfies TextDefs

export const HOME_CASES_TEXTS = {
  kicker: ['小标题', 'CUSTOMER CASES', { hideable: true }],
  title: ['标题', 'Customer Case Studies', { hideable: true }],
  subtitle: ['副标题', ''],
  cardButton: ['卡片链接', 'View Case →', { hideable: true }],
  allButton: ['底部按钮', 'View All Case Studies →', { hideable: true }],
} as const satisfies TextDefs

export const ABOUT_BANNER_TEXTS = {
  title: ['页面主标题', 'About Us'],
  subtitle: ['副标题', ''],
} as const satisfies TextDefs

export const ABOUT_INTRO_TEXTS = {
  kicker: ['小标题', 'OUR COMPANY', { hideable: true }],
  title: ['标题', 'Company Profile', { hideable: true }],
  buttonText: ['按钮', 'Contact Us →', { hideable: true }],
} as const satisfies TextDefs

export const ABOUT_SCENES_TEXTS = {
  title: ['标题', 'Facilities & Team', { hideable: true }],
  subtitle: ['副标题', ''],
} as const satisfies TextDefs

export const ABOUT_CAPABILITIES_TEXTS = {
  title: ['标题', 'Capabilities & Support', { hideable: true }],
  subtitle: ['副标题', ''],
} as const satisfies TextDefs

export const PRODUCTS_PAGE_TEXTS = {
  title: ['页面主标题', 'Products'],
  subtitle: ['副标题', 'Production Lines', { hideable: true }],
  intro: ['简介', '', { textarea: true }],
} as const satisfies TextDefs

export const CASES_PAGE_TEXTS = {
  title: ['页面主标题', 'Case Studies'],
  subtitle: ['副标题', ''],
  listTitle: ['模块标题', 'Project Stories', { hideable: true }],
  listSubtitle: ['模块副标题', 'Equipment delivery, installation and commissioning projects.', { hideable: true }],
} as const satisfies TextDefs

export const CONTACT_PAGE_TEXTS = {
  title: ['页面主标题', 'Contact Us'],
  kicker: ['小标题', 'GET IN TOUCH', { hideable: true }],
  heading: ['标题', 'Talk to Our Team', { hideable: true }],
  intro: ['简介', '', { textarea: true }],
  formTitle: ['表单标题', 'Send Your Inquiry', { hideable: true }],
  emailLabel: ['联系项：邮箱', 'Email'],
  phoneLabel: ['联系项：电话', 'Phone'],
  whatsappLabel: ['联系项：WhatsApp', 'WhatsApp'],
  phoneWhatsappLabel: ['联系项：电话与 WhatsApp 相同时', 'Phone / WhatsApp'],
  addressLabel: ['联系项：地址', 'Address'],
  hoursLabel: ['联系项：办公时间', 'Office Hours'],
} as const satisfies TextDefs

// 辅助页面（pages 集合）没有录入时的默认标题和正文段落；pageName 是浏览器标签里的页面名（英文界面文案第十八章），不写时用标题
export const PAGE_DEFAULTS = {
  'privacy-policy': { title: 'Privacy Policy', body: [] as string[] },
  'cookie-notice': { title: 'Cookie Notice', body: [] as string[] },
  'thank-you': {
    title: 'Thank You for Your Inquiry',
    pageName: 'Thank You',
    body: [
      'We have received your inquiry. Our team will review your requirements and reply to you by email as soon as possible.',
      'What Happens Next',
      '1. Our team reviews your requirements.',
      '2. We contact you to confirm details such as raw material, capacity and power supply.',
      '3. We send you a suggested configuration and quotation.',
    ],
  },
  'not-found': {
    title: 'Page Not Found',
    pageName: 'Page Not Found',
    body: ["Sorry, the page you're looking for doesn't exist or may have been moved."],
  },
} as const

export type AuxPageSlug = keyof typeof PAGE_DEFAULTS
