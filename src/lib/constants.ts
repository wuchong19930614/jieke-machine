// 全站共用的选项常量：后台字段选项和前台渲染都从这里取，保证两边一致

export const ROLES = [
  { label: '管理员', value: 'admin' },
  { label: '内容编辑', value: 'editor' },
  { label: '业务人员', value: 'sales' },
  { label: '开发协作', value: 'developer' },
] as const
export type Role = (typeof ROLES)[number]['value']

// 模块背景（技术方案 5.2）
export const SECTION_BACKGROUNDS = [
  { label: '默认', value: 'default' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '蓝色', value: 'blue' },
] as const
export type SectionBackground = (typeof SECTION_BACKGROUNDS)[number]['value']

// 图框比例与适配方式（技术方案 5.2）
export const IMAGE_RATIOS = [
  { label: '按用途默认', value: 'default' },
  { label: '4:3', value: '4/3' },
  { label: '1:1', value: '1/1' },
  { label: '3:2', value: '3/2' },
  { label: '16:9', value: '16/9' },
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
  { label: '需求与服务', value: 'services' },
  { label: '公司数据通栏', value: 'companyStats' },
  { label: '公司简介', value: 'aboutIntro' },
  { label: '厂房展示', value: 'factoryGallery' },
  { label: '四类生产线', value: 'productLines' },
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
