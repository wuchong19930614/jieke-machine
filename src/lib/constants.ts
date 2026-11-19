// 全站共用的选项常量：后台字段选项和前台渲染都从这里取，保证两边一致

export const ROLES = [
  { label: '管理员', value: 'admin' },
  { label: '内容编辑', value: 'editor' },
  { label: '业务人员', value: 'sales' },
  { label: '开发协作', value: 'developer' },
] as const
export type Role = (typeof ROLES)[number]['value']

// 模块背景（技术方案 5.2）
// 前 4 个沿用最初的取值（已有数据不变）；深色背景上文字自动变白（见 components/Section.tsx）
export const SECTION_BACKGROUNDS = [
  { label: '默认（白色）', value: 'default' },
  { label: '浅灰', value: 'light' },
  { label: '米白 #FAF6EF', value: 'cream' },
  { label: '浅蓝 #EAF2FB', value: 'sky' },
  { label: '浅绿 #EAF5EE', value: 'mint' },
  { label: '浅橙 #FDF0E8', value: 'peach' },
  { label: '品牌蓝（跟随主题）', value: 'blue' },
  { label: '深蓝（跟随主题）', value: 'dark' },
  { label: '石墨 #22272E', value: 'graphite' },
  { label: '深绿 #16352C', value: 'forest' },
  { label: '橙色（跟随询盘按钮颜色）', value: 'orange' },
  { label: '深红 #7A1F1F', value: 'maroon' },
  { label: '自定义颜色…', value: 'custom' },
] as const
export type SectionBackground = (typeof SECTION_BACKGROUNDS)[number]['value']

// 图框比例与适配方式（技术方案 5.2）
export const IMAGE_RATIOS = [
  { label: '按用途默认', value: 'default' },
  { label: '4:3', value: '4/3' },
  { label: '1:1', value: '1/1' },
  { label: '3:2', value: '3/2' },
  { label: '16:9', value: '16/9' },
  { label: '3:4（竖图）', value: '3/4' },
  { label: '2:3（竖图）', value: '2/3' },
  { label: '9:16（手机竖屏）', value: '9/16' },
  { label: '自定义…', value: 'custom' },
  { label: '原图比例', value: 'original' },
] as const
export const IMAGE_FITS = [
  { label: '按用途默认', value: 'default' },
  { label: '完整展示', value: 'contain' },
  { label: '填满裁切', value: 'cover' },
] as const
export type ImageRatio = (typeof IMAGE_RATIOS)[number]['value']
export type ImageFit = (typeof IMAGE_FITS)[number]['value']

export const MEDIA_USAGES = [
  { label: '设备', value: 'equipment' },
  { label: '工厂', value: 'factory' },
  { label: '团队', value: 'team' },
  { label: '案例', value: 'case' },
  { label: '成品', value: 'application' },
  { label: 'Banner', value: 'banner' },
  { label: '文档', value: 'document' },
  { label: '其他', value: 'other' },
] as const

// 首页模块（技术方案 3.3，默认顺序按需求书第二部分）
export const HOME_SECTIONS = [
  { label: 'Banner 轮播', value: 'banners' },
  { label: '核心生产线', value: 'productLines' },
  { label: '公司数据通栏', value: 'companyStats' },
  { label: '公司简介', value: 'aboutIntro' },
  { label: '厂房展示', value: 'factoryGallery' },
  { label: '需求与服务', value: 'services' },
  { label: '客户案例', value: 'featuredCases' },
] as const
export type HomeSectionKey = (typeof HOME_SECTIONS)[number]['value']

export const HOME_SECTION_DEFAULT_BACKGROUND: Record<HomeSectionKey, SectionBackground> = {
  banners: 'default',
  services: 'default',
  companyStats: 'blue',
  aboutIntro: 'dark',
  factoryGallery: 'default',
  productLines: 'blue',
  featuredCases: 'light',
}

export const ABOUT_SECTIONS = [
  { label: '公司介绍', value: 'intro' },
  { label: '生产场景与团队', value: 'scenes' },
  { label: '供应能力与服务支持', value: 'capabilities' },
] as const
export type AboutSectionKey = (typeof ABOUT_SECTIONS)[number]['value']

export const ABOUT_SECTION_DEFAULT_BACKGROUND: Record<AboutSectionKey, SectionBackground> = {
  intro: 'default',
  scenes: 'light',
  capabilities: 'default',
}

// 产品详情 14 个模块（需求书第三部分）
export const PRODUCT_SECTIONS = [
  { label: '1 横幅与简介', value: 'hero' },
  { label: '2 可生产成品', value: 'applications' },
  { label: '3 图文介绍', value: 'introduction' },
  { label: '4 设备特点与报价入口', value: 'features' },
  { label: '5 工艺流程', value: 'process' },
  { label: '6 参数表', value: 'specs' },
  { label: '7 适用客户与项目支持', value: 'audience' },
  { label: '8 FAQ', value: 'faqs' },
  { label: '9 运行视频', value: 'video' },
  { label: '10 设备优势', value: 'advantages' },
  { label: '11 工艺步骤切换', value: 'processSteps' },
  { label: '12 相关生产线', value: 'relatedProducts' },
  { label: '13 客户案例', value: 'relatedCases' },
  { label: '14 询盘表单', value: 'inquiry' },
] as const
export type ProductSectionKey = (typeof PRODUCT_SECTIONS)[number]['value']

// 原型 v18 中各产品模块的默认背景，保证上线效果与原型一致
export const PRODUCT_SECTION_DEFAULT_BACKGROUND: Record<ProductSectionKey, SectionBackground> = {
  hero: 'light',
  applications: 'default',
  introduction: 'light',
  features: 'light',
  process: 'light',
  specs: 'light',
  audience: 'light',
  faqs: 'light',
  video: 'light',
  advantages: 'dark',
  processSteps: 'default',
  relatedProducts: 'light',
  relatedCases: 'default',
  inquiry: 'light',
}

export const INQUIRY_SOURCES = [
  { label: '联系页', value: 'contact_page' },
  { label: '产品页', value: 'product_page' },
  { label: '联系弹窗', value: 'popup' },
  { label: '离线留言', value: 'offline_message' },
] as const
export type InquirySource = (typeof INQUIRY_SOURCES)[number]['value']

export const INQUIRY_STATUSES = [
  { label: '新询盘', value: 'new' },
  { label: '已联系', value: 'contacted' },
  { label: '已报价', value: 'quoted' },
  { label: '成交', value: 'won' },
  { label: '无效', value: 'invalid' },
] as const

export const MAIL_STATUSES = [
  { label: '待发送', value: 'pending' },
  { label: '已发送', value: 'sent' },
  { label: '失败', value: 'failed' },
  { label: '不发送', value: 'skipped' },
] as const
export type MailStatus = (typeof MAIL_STATUSES)[number]['value']

export const SPAM_FLAGS = [
  { label: '无', value: 'none' },
  { label: '填写过快', value: 'too_fast' },
  { label: '网址过多', value: 'too_many_links' },
] as const
export type SpamFlag = (typeof SPAM_FLAGS)[number]['value']

// 服务图标：前台用 lucide-react 渲染，后台只能从这里选（技术方案 3.3“内置图标库”）
export const SERVICE_ICONS = [
  { label: '工厂', value: 'factory' },
  { label: '齿轮', value: 'settings' },
  { label: '清单', value: 'clipboard-list' },
  { label: '扳手', value: 'wrench' },
  { label: '包裹', value: 'package' },
  { label: '耳机', value: 'headset' },
  { label: '卡车', value: 'truck' },
  { label: '地球', value: 'globe' },
  { label: '盾牌', value: 'shield-check' },
  { label: '奖杯', value: 'award' },
  { label: '用户', value: 'users' },
  { label: '闪电', value: 'zap' },
] as const

// 新建产品时预填的参数行（需求书第三部分、英文界面文案 6.5）；产品编号和型号不重复预填
export const DEFAULT_SPEC_ROWS = [
  'Raw Material',
  'Final Product',
  'Capacity (kg/h)',
  'Capacity Test Conditions',
  'Included Equipment',
  'Optional Equipment',
  'Power (kW)',
  'Voltage (V)',
  'Frequency (Hz)',
  'Phase',
  'Dimensions (L × W × H, mm)',
  'Weight (kg)',
  'Machine Material',
  'Site Requirements',
  'Scope of Supply',
  'Installation & Training',
  'Warranty & Spare Parts',
] as const

export const CASES_PER_PAGE_DEFAULT = 9
export const INQUIRY_RETENTION_DAYS = 365
export const BACKUP_RETENTION_DAYS = 30
export const MAX_NOTIFY_ATTEMPTS = 10

// 文字样式（第 4、15 点）可选字体；空值 = 跟随主题。键与 globals/Theme.ts 的 FONTS 一致
export const TEXT_STYLE_FONTS = [
  { label: '跟随主题', value: '' },
  { label: 'Arial', value: 'system' },
  { label: 'Inter', value: 'inter' },
  { label: 'Montserrat', value: 'montserrat' },
  { label: 'Open Sans', value: 'open-sans' },
] as const
// 文字样式色板：白、深色字、灰色字、品牌蓝、橙、浅金
export const TEXT_STYLE_SWATCHES = ['#FFFFFF', '#142B42', '#647587', '#3275DF', '#E7662B', '#F5C26B'] as const

// 首页可以插入多个的图片类模块（第 1 点），和固定模块一起在“模块顺序”里拖动
export const IMAGE_SECTION_MODULES = [
  { label: '图片模块（整张图片）', value: 'imageBanner' },
  { label: '图片网格（一行多张）', value: 'imageGrid' },
] as const
export type ImageSectionModule = (typeof IMAGE_SECTION_MODULES)[number]['value']
export const isImageSectionModule = (value: unknown): value is ImageSectionModule => value === 'imageBanner' || value === 'imageGrid'

// 模块“显示在”（第 2 点）：手机 < 768px，平板和电脑算同一类
export const SECTION_DEVICES = [
  { label: '电脑和手机', value: 'all' },
  { label: '仅电脑和平板', value: 'desktop' },
  { label: '仅手机', value: 'mobile' },
] as const

// 6 位色号（# 加 6 位十六进制）：后台校验、前台清洗、背景深浅判断共用
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
