// 首页配置（技术方案 3.3），模块默认顺序按需求书第二部分
import { textFields } from '@/content/defineTexts'
import {
  CONTACT_BAND_TEXTS,
  HOME_ABOUT_TEXTS,
  HOME_CASES_TEXTS,
  HOME_FACTORY_TEXTS,
  HOME_LINES_TEXTS,
  HOME_SERVICES_TEXTS,
  HOME_STATS_TEXTS,
  UI_BANNER,
} from '@/content/texts'
import { at, hideField, imageField, linkField, photoGalleryField, ratioFitFields, sectionsField, seoGroup, textStyleField, titleRowLabel } from '@/fields'
import { PATHS } from '@/hooks/revalidate'
import { HOME_SECTION_DEFAULT_BACKGROUND, HOME_SECTIONS, SERVICE_ICONS } from '@/lib/constants'

import { editableGlobal } from './helpers'

const H = '首页'

export const HomePage = editableGlobal({
  slug: 'home-page',
  label: '首页',
  group: '页面管理',
  beforeDocumentControls: ['@/admin/components/FullWidthHomePreview#FullWidthHomePreview'],
  refresh: [PATHS.home],
  fields: [
    sectionsField(HOME_SECTIONS, H, HOME_SECTION_DEFAULT_BACKGROUND, { imageModules: true }),
    { name: 'homeEditorOrder', type: 'ui', admin: { components: { Field: '@/admin/components/HomeEditorOrder#HomeEditorOrder' } } },
    { name: 'showTopBar', type: 'checkbox', label: '首页显示顶部联系方式细条', defaultValue: false, admin: { description: 'V4 样稿默认隐藏首页顶部细条；右侧联系浮窗仍按原设置显示。' } },
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
                  admin: { width: '50%', description: '请选高清原图，建议 1920×800 px 以上。所有横幅共用一个比例，可在“主题 › 默认图框比例 › Banner”中设置。' },
                },
                {
                  name: 'mobileImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: '手机图',
                  filterOptions: { mimeType: { contains: 'image' } },
                  admin: { width: '50%', description: '建议 1080×1440 px，主体靠中间；不填时用桌面图按焦点裁切。' },
                },
              ],
            },
            {
              name: 'overlay',
              type: 'number',
              label: '图片遮罩深浅（%）',
              min: 0,
              max: 90,
              defaultValue: 50,
              admin: {
                step: 5,
                description: '调节文字所在区域的渐变遮罩。默认优先突出图片；图片较亮时可调深一点。',
                components: { Field: '@/admin/components/RangeField#RangeField' },
              },
            },
            {
              type: 'row',
              fields: [{ name: 'kicker', type: 'text', label: '小标题', admin: { width: '75%', placeholder: UI_BANNER.kickerDefault[1] } }, hideField('kicker', '小标题')],
            },
            textStyleField('kicker', '小标题'),
            { name: 'title', type: 'text', label: '标题', required: true },
            textStyleField('title', '标题'),
            { name: 'subtitle', type: 'textarea', label: '副标题' },
            textStyleField('subtitle', '副标题'),
            {
              type: 'row',
              fields: [
                { name: 'quoteButtonText', type: 'text', label: '报价按钮', admin: { width: '75%', placeholder: UI_BANNER.quoteButton[1], description: '进入联系页并带入关联产品' } },
                hideField('quoteButtonText', '报价按钮'),
              ],
            },
            textStyleField('quoteButtonText', '报价按钮', { opacity: false }),
            linkField({ name: 'quoteLink', label: '报价按钮跳转', location: `${H} › Banner 报价按钮`, defaultLabel: '联系页（有关联产品时带入产品）' }),
            {
              type: 'row',
              fields: [
                { name: 'productButtonText', type: 'text', label: '产品按钮', admin: { width: '75%', placeholder: UI_BANNER.productButton[1], description: '进入关联产品详情；没有已发布的关联产品时进入产品列表。' } },
                hideField('productButtonText', '产品按钮'),
              ],
            },
            textStyleField('productButtonText', '产品按钮', { opacity: false }),
            linkField({ name: 'productLink', label: '产品按钮跳转', location: `${H} › Banner 产品按钮`, defaultLabel: '关联产品或产品列表' }),
            { name: 'product', type: 'relationship', relationTo: 'products', label: '关联产品', admin: { description: '“查看产品”链接自动取该产品的网址' } },
            linkField({ name: 'link', label: '点击横幅图片跳转', location: `${H} › Banner 图片上文字和按钮以外的地方`, defaultLabel: '不跳转' }),
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
        ...textFields(HOME_SERVICES_TEXTS, `${H} › 需求与服务`, { styled: true }),
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
            textStyleField('name', '服务名称'),
          ],
        },
      ],
    },
    {
      name: 'companyStats',
      type: 'group',
      label: '公司数据通栏',
      admin: { description: at(`${H} › 公司数据通栏`, '可以为这里单独设置公司名或隐藏公司名') },
      fields: [
        ...textFields(HOME_STATS_TEXTS, `${H} › 公司数据通栏`, { styled: true }),
        {
          type: 'row',
          fields: [
            { name: 'companyName', type: 'text', label: '通栏公司名', admin: { width: '75%', description: '留空时显示全站公司名。此项只影响首页数据通栏。' } },
            hideField('companyName', '通栏公司名'),
          ],
        },
        textStyleField('companyName', '通栏公司名'),
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
            textStyleField('value', '数值'),
            textStyleField('label', '数据标签'),
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
        ...textFields(HOME_ABOUT_TEXTS, `${H} › 公司简介`, { styled: true }),
        linkField({ name: 'buttonLink', label: '公司简介按钮跳转', location: `${H} › 公司简介按钮`, defaultLabel: '关于我们' }),
        hideField('tags', '全部优势标签'),
        {
          name: 'tags',
          type: 'array',
          label: '优势标签',
          labels: { singular: '标签', plural: '标签' },
          admin: { description: '逐条展开可隐藏；通过每行右侧的菜单可以删除。', components: { RowLabel: titleRowLabel('label') } },
          defaultValue: [
            { label: 'Reliable Supplier' },
            { label: 'Extensive Experience' },
            { label: 'Wide Range of Models' },
            { label: 'Strict Quality Inspection' },
          ],
          fields: [
            { name: 'label', type: 'text', label: '标签', required: true },
            { name: 'visible', type: 'checkbox', label: '在首页显示', defaultValue: true },
            textStyleField('label', '优势标签'),
          ],
        },
        { name: 'body', type: 'richText', label: '简介正文', admin: { description: at(`${H} › 公司简介 › 正文`) } },
        textStyleField('body', '简介正文'),
        imageField({ name: 'image', label: '公司简介配图', location: `${H} › 公司简介`, hint: '建议 1200×800 px；留空时使用「关于我们 › 公司介绍」配图。' }),
        photoGalleryField(`${H} › 公司简介右侧图集（留空沿用现有单图或关于我们图集）`),
      ],
    },
    {
      name: 'factoryGallery',
      type: 'group',
      label: '厂房展示',
      admin: { description: at(`${H} › Factory & Workshop`, '初始 6 张，桌面 3 列 2 行') },
      fields: [
        ...textFields(HOME_FACTORY_TEXTS, `${H} › 厂房展示`, { styled: true }),
        {
          type: 'row',
          fields: ratioFitFields('images', `${H} › 厂房展示（对下面所有图片生效；单张图片另选了比例时以单张为准）`),
        },
        {
          // 第 3 点：原来的多图字段改成列表，每张图可以单独设链接（迁移时已把原有图片按顺序搬过来）
          name: 'items',
          type: 'array',
          label: '图片',
          labels: { singular: '图片', plural: '图片' },
          admin: { description: at(`${H} › 厂房展示`, '拖动调整顺序；每张图可以设置点击后跳到哪里'), initCollapsed: true },
          fields: [
            imageField({ name: 'image', label: '图片', location: `${H} › 厂房展示`, required: true }),
            linkField({ location: `${H} › 厂房展示 › 点击图片跳转` }),
          ],
        },
      ],
    },
    {
      name: 'productLines',
      type: 'group',
      label: '核心生产线',
      admin: { description: at(`${H} › 生产线`, '选中顺序即轮播顺序；大图来自各产品的列表图。') },
      fields: [
        ...textFields(HOME_LINES_TEXTS, `${H} › 生产线`, { styled: true }),
        linkField({ name: 'inquiryLink', label: '生产线咨询按钮跳转', location: `${H} › 生产线 › 咨询按钮`, defaultLabel: '联系页' }),
        { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true, label: '生产线' },
      ],
    },
    {
      name: 'featuredCases',
      type: 'group',
      label: '客户案例',
      admin: { description: at(`${H} › Customer Case Studies`, '最多 3 个。每个案例的封面、国家、设备和图片说明在对应案例记录中编辑。') },
      fields: [
        ...textFields(HOME_CASES_TEXTS, `${H} › 客户案例`, { styled: true }),
        linkField({ name: 'allLink', label: '查看案例按钮跳转', location: `${H} › 客户案例 › 查看全部`, defaultLabel: '案例列表' }),
        { name: 'cases', type: 'relationship', relationTo: 'cases', hasMany: true, maxRows: 3, label: '精选案例' },
      ],
    },
    {
      name: 'inquiry',
      type: 'group',
      label: '首页询价',
      admin: { description: 'V4 首页底部询价区。关闭独立设置时，跟随全站设置里的报价引导条。' },
      fields: [
        { name: 'custom', type: 'checkbox', label: '使用首页独立文案', defaultValue: false },
        ...textFields(CONTACT_BAND_TEXTS, `${H} › 首页询价`, { styled: true }),
        linkField({ location: `${H} › 首页询价按钮`, defaultLabel: '联系页' }),
      ],
    },
    seoGroup(H, 'jk-home-seo'),
  ],
})

