// 首页配置（技术方案 3.3），模块默认顺序按需求书第二部分
import { textFields } from '@/content/defineTexts'
import {
  HOME_ABOUT_TEXTS,
  HOME_CASES_TEXTS,
  HOME_FACTORY_TEXTS,
  HOME_LINES_TEXTS,
  HOME_SERVICES_TEXTS,
  HOME_STATS_TEXTS,
  UI_BANNER,
} from '@/content/texts'
import { at, hideField, sectionsField, seoGroup, titleRowLabel } from '@/fields'
import { PATHS } from '@/hooks/revalidate'
import { HOME_SECTION_DEFAULT_BACKGROUND, HOME_SECTIONS, SERVICE_ICONS } from '@/lib/constants'

import { editableGlobal } from './helpers'

const H = '首页'

export const HomePage = editableGlobal({
  slug: 'home-page',
  label: '首页',
  group: '页面管理',
  refresh: [PATHS.home],
  fields: [
    sectionsField(HOME_SECTIONS, H, HOME_SECTION_DEFAULT_BACKGROUND),
    {
      name: 'banners',
      type: 'group',
      label: 'Banner 轮播',
      admin: { description: at(`${H} › Banner`, '按顺序播放已启用的 Banner，每 5 秒切换一次') },
      fields: [
        {
          name: 'slides',
          type: 'array',
          label: 'Banner',
          labels: { singular: 'Banner', plural: 'Banner' },
          admin: { components: { RowLabel: titleRowLabel('title') } },
          fields: [
            { name: 'enabled', type: 'checkbox', label: '启用', defaultValue: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'desktopImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: '桌面图',
                  filterOptions: { mimeType: { contains: 'image' } },
                  admin: { width: '50%', description: '建议 1920×800 以上' },
                },
                {
                  name: 'mobileImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: '手机图',
                  filterOptions: { mimeType: { contains: 'image' } },
                  admin: { width: '50%', description: '不填时用桌面图按焦点裁切' },
                },
              ],
            },
            {
              type: 'row',
              fields: [{ name: 'kicker', type: 'text', label: '小标题', admin: { width: '75%', placeholder: UI_BANNER.kickerDefault[1] } }, hideField('kicker', '小标题')],
            },
            { name: 'title', type: 'text', label: '标题', required: true },
            { name: 'subtitle', type: 'textarea', label: '副标题' },
            {
              type: 'row',
              fields: [
                { name: 'quoteButtonText', type: 'text', label: '报价按钮', admin: { width: '75%', placeholder: UI_BANNER.quoteButton[1], description: '进入联系页并带入关联产品' } },
                hideField('quoteButtonText', '报价按钮'),
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'productButtonText', type: 'text', label: '产品按钮', admin: { width: '75%', placeholder: UI_BANNER.productButton[1], description: '进入关联产品详情' } },
                hideField('productButtonText', '产品按钮'),
              ],
            },
            { name: 'product', type: 'relationship', relationTo: 'products', label: '关联产品', admin: { description: '“查看产品”链接自动取该产品的网址' } },
          ],
        },
      ],
    },
    {
      name: 'services',
      type: 'group',
      label: '需求与服务',
      admin: { description: at(`${H} › Solutions for Your Requirements`) },
      fields: [
        ...textFields(HOME_SERVICES_TEXTS, `${H} › 需求与服务`),
        {
          name: 'items',
          type: 'array',
          label: '服务项目',
          labels: { singular: '服务', plural: '服务' },
          admin: { description: '初始 6 项，图标从内置图标库选择；服务名称请按真实情况确认', components: { RowLabel: titleRowLabel('name') } },
          defaultValue: [
            { icon: 'factory', name: 'Factory-Direct Supply' },
            { icon: 'settings', name: 'Custom Configuration' },
            { icon: 'clipboard-list', name: 'Project Planning' },
            { icon: 'wrench', name: 'Installation & Commissioning' },
            { icon: 'package', name: 'Packing & Shipping' },
            { icon: 'headset', name: 'After-Sales Support' },
          ],
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'icon', type: 'select', label: '图标', options: [...SERVICE_ICONS], defaultValue: 'factory', admin: { width: '40%' } },
                { name: 'name', type: 'text', label: '服务名称', required: true, admin: { width: '60%' } },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'companyStats',
      type: 'group',
      label: '公司数据通栏',
      admin: { description: at(`${H} › 公司数据通栏`, '公司名自动取全站设置') },
      fields: [
        ...textFields(HOME_STATS_TEXTS, `${H} › 公司数据通栏`),
        {
          name: 'stats',
          type: 'array',
          label: '数据',
          labels: { singular: '数据', plural: '数据' },
          maxRows: 5,
          admin: { description: '最多 5 组，例如 15+ / Years in Business', components: { RowLabel: titleRowLabel('label') } },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'value', type: 'text', label: '数值', required: true, admin: { width: '40%' } },
                { name: 'label', type: 'text', label: '标签', required: true, admin: { width: '60%' } },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'aboutIntro',
      type: 'group',
      label: '公司简介',
      admin: { description: at(`${H} › About Us`) },
      fields: [
        ...textFields(HOME_ABOUT_TEXTS, `${H} › 公司简介`),
        {
          name: 'tags',
          type: 'array',
          label: '优势标签',
          labels: { singular: '标签', plural: '标签' },
          admin: { description: '属宣传性表述，请确认属实后再用', components: { RowLabel: titleRowLabel('label') } },
          defaultValue: [
            { label: 'Reliable Supplier' },
            { label: 'Extensive Experience' },
            { label: 'Wide Range of Models' },
            { label: 'Strict Quality Inspection' },
          ],
          fields: [{ name: 'label', type: 'text', label: '标签', required: true }],
        },
        { name: 'body', type: 'richText', label: '简介正文', admin: { description: at(`${H} › 公司简介 › 正文`) } },
      ],
    },
    {
      name: 'factoryGallery',
      type: 'group',
      label: '厂房展示',
      admin: { description: at(`${H} › Factory & Workshop`, '初始 6 张，桌面 3 列 2 行') },
      fields: [
        ...textFields(HOME_FACTORY_TEXTS, `${H} › 厂房展示`),
        {
          name: 'images',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          label: '图片',
          filterOptions: { mimeType: { contains: 'image' } },
        },
      ],
    },
    {
      name: 'productLines',
      type: 'group',
      label: '四类生产线',
      admin: { description: at(`${H} › 生产线`, '选中顺序即显示顺序') },
      fields: [
        ...textFields(HOME_LINES_TEXTS, `${H} › 生产线`),
        { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true, label: '生产线' },
      ],
    },
    {
      name: 'featuredCases',
      type: 'group',
      label: '客户案例',
      admin: { description: at(`${H} › Customer Case Studies`, '最多 3 个；有视频时显示 16:9 视频封面，点击后原位播放') },
      fields: [
        ...textFields(HOME_CASES_TEXTS, `${H} › 客户案例`),
        { name: 'cases', type: 'relationship', relationTo: 'cases', hasMany: true, maxRows: 3, label: '精选案例' },
      ],
    },
    seoGroup(H),
  ],
})

