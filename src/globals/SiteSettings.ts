// 全站设置（技术方案 3.2）：品牌、联系方式、社交媒体、公共组件文案、客服、邮件、统计和默认 SEO
import type { TextFieldSingleValidation } from 'payload'

import { textGroup } from '@/content/defineTexts'
import {
  AUTO_REPLY_TEXTS,
  BLUE_PANEL_TEXTS,
  CONTACT_BAND_TEXTS,
  FLOATING_TEXTS,
  FORM_TEXTS,
  NAV_TEXTS,
  RED_PANEL_TEXTS,
  SEO_TEXTS,
  WHATSAPP_TEXTS,
} from '@/content/texts'
import { at } from '@/fields'
import { PATHS } from '@/hooks/revalidate'

import { editableGlobal } from './helpers'

const validateUrl: TextFieldSingleValidation = (value) => {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? true : '请填写以 https:// 开头的网址'
  } catch {
    return '请填写完整网址，例如 https://www.facebook.com/yourpage'
  }
}

const social = (name: string, label: string) => ({
  name,
  type: 'text' as const,
  label,
  validate: validateUrl,
  admin: { description: at('页脚 › Follow Us', '留空则不显示该图标') },
})

export const SiteSettings = editableGlobal({
  slug: 'site-settings',
  label: '全站设置',
  group: '全站设置',
  refresh: [PATHS.everything],
  description: '这里的联系方式是全站唯一来源，会同步到顶栏、页脚、联系页、弹窗和悬浮栏',
  fields: [
    {
      type: 'collapsible',
      label: '品牌',
      fields: [
        { name: 'companyName', type: 'text', label: '公司英文名', admin: { description: at('页头 Logo 旁、页脚、首页公司数据通栏、邮件署名') } },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo',
          filterOptions: { mimeType: { contains: 'image' } },
          admin: { description: at('页头、页脚、蓝色在线沟通面板', '建议透明背景 PNG，高度 80px 以上') },
        },
        { name: 'footerIntro', type: 'textarea', label: '页脚简介', admin: { description: at('页脚 › 品牌区') } },
      ],
    },
    {
      type: 'collapsible',
      label: '联系方式',
      fields: [
        { name: 'email', type: 'email', label: '业务邮箱', admin: { description: at('顶栏、页脚、联系页、邮箱弹层') } },
        {
          type: 'row',
          fields: [
            { name: 'phone', type: 'text', label: '电话', admin: { width: '50%', description: at('页脚、联系页、电话弹层', '带国际区号，如 +86 138 0000 0000') } },
            {
              name: 'whatsapp',
              type: 'text',
              label: 'WhatsApp 号码',
              validate: (value: string | null | undefined) =>
                !value || /^\+?[0-9 ()-]{6,24}$/.test(value) ? true : '请填写带国际区号的号码，如 +86 138 0000 0000',
              admin: { width: '50%', description: at('顶栏、页脚、联系页、提交成功页、手机底部按钮条', '带国际区号；点击时打开 WhatsApp 对话') },
            },
          ],
        },
        { name: 'address', type: 'textarea', label: '地址', admin: { description: at('页脚、联系页') } },
        { name: 'officeHours', type: 'text', label: '办公时间', admin: { description: at('联系页', '建议注明时区，如 Mon–Sat, 9:00–18:00 (GMT+8)') } },
      ],
    },
    {
      type: 'collapsible',
      label: '社交媒体',
      admin: { initCollapsed: true },
      fields: [
        social('facebook', 'Facebook'),
        social('instagram', 'Instagram'),
        social('tiktok', 'TikTok'),
        social('youtube', 'YouTube'),
        social('linkedin', 'LinkedIn'),
      ],
    },
    {
      type: 'collapsible',
      label: '公共组件文案',
      admin: { initCollapsed: true },
      fields: [
        textGroup('navLabels', '导航', '页头导航和页脚 Quick Links（顺序固定）', NAV_TEXTS),
        textGroup('floatingTools', '右侧悬浮栏', '右侧悬浮栏的提示文字', FLOATING_TEXTS),
        textGroup('contactBand', '报价引导条', '所有页面的页脚上方', CONTACT_BAND_TEXTS),
        textGroup('formTexts', '表单文案', '联系页、产品页、联系弹窗和离线留言四种表单', FORM_TEXTS),
      ],
    },
    {
      type: 'collapsible',
      label: '在线客服（tawk.to）',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'tawkPropertyId', type: 'text', label: 'tawk.to Property ID', admin: { width: '50%', description: at('红色在线服务窗口、蓝色在线沟通面板接入的在线客服；不填时按离线处理', '在 tawk.to 后台 Administration › Chat Widget 中查看') } },
            { name: 'tawkWidgetId', type: 'text', label: 'tawk.to Widget ID', admin: { width: '50%', description: at('同上', '通常为 default 或一串字符') } },
          ],
        },
        textGroup('redPanel', '红色在线服务窗口', '悬浮栏第 4 个按钮打开的窗口', RED_PANEL_TEXTS),
        textGroup('bluePanel', '蓝色在线沟通面板', '悬浮栏第 6 个按钮打开的欢迎面板', BLUE_PANEL_TEXTS),
      ],
    },
    {
      type: 'collapsible',
      label: 'WhatsApp 预填消息',
      admin: { initCollapsed: true },
      fields: [textGroup('whatsappTexts', 'WhatsApp', '点击 WhatsApp 链接时预填的第一句话（不含客户信息）', WHATSAPP_TEXTS)],
    },
    {
      type: 'collapsible',
      label: '询盘邮件',
      admin: { initCollapsed: true },
      fields: [
        { name: 'notifyEmail', type: 'email', label: '询盘通知邮箱', admin: { description: at('不在前台显示', '新询盘通知发到这个邮箱（1 个）') } },
        textGroup('autoReply', '客户自动回复', '提交询盘后发给客户的确认邮件', AUTO_REPLY_TEXTS),
      ],
    },
    {
      type: 'collapsible',
      label: '统计、收录与安全',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'allowIndexing',
          type: 'checkbox',
          label: '允许搜索引擎收录',
          defaultValue: false,
          admin: { description: '主要页面内容录入完成前保持不勾选（全站 noindex）；录入完成后勾选并发布，再到 Search Console 提交网站地图（技术方案 8.1）。测试环境始终不收录。' },
        },
        {
          name: 'gtmId',
          type: 'text',
          label: 'GTM 容器编号',
          validate: (value: string | null | undefined) => (!value || /^GTM-[A-Z0-9]+$/.test(value) ? true : '格式应为 GTM-XXXXXXX'),
          admin: { description: at('不在页面上显示，用于加载统计代码', 'GA4 和以后的广告转化都在 GTM 里配置') },
        },
        {
          type: 'row',
          fields: [
            { name: 'turnstileEnabled', type: 'checkbox', label: '开启人机验证（Cloudflare Turnstile）', defaultValue: false, admin: { width: '50%', description: '垃圾询盘仍然很多时再开启；需同时在环境变量里配置密钥' } },
            { name: 'turnstileSiteKey', type: 'text', label: 'Turnstile Site Key', admin: { width: '50%', description: at('询盘表单里的人机验证框（开启人机验证后显示）') } },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: '默认 SEO 与网站图标',
      admin: { initCollapsed: true },
      fields: [
        textGroup('seoTexts', '默认 SEO', '浏览器标签标题和搜索结果描述', SEO_TEXTS),
        {
          name: 'defaultOgImage',
          type: 'upload',
          relationTo: 'media',
          label: '默认分享图',
          filterOptions: { mimeType: { contains: 'image' } },
          admin: { description: at('分享到社交平台时的预览图', '1200×630；页面没有单独设置时使用') },
        },
        {
          type: 'row',
          fields: [
            { name: 'favicon', type: 'upload', relationTo: 'media', label: '网站图标', filterOptions: { mimeType: { equals: 'image/png' } }, admin: { width: '50%', description: at('浏览器标签页上的小图标', '正方形 PNG，至少 48×48') } },
            { name: 'appleTouchIcon', type: 'upload', relationTo: 'media', label: '苹果触屏图标', filterOptions: { mimeType: { equals: 'image/png' } }, admin: { width: '50%', description: at('苹果设备添加到主屏幕时的图标', '180×180 PNG') } },
          ],
        },
      ],
    },
  ],
})
