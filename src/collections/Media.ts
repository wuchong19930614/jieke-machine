// 媒体库（技术方案 3.6、5.4）：图片和 PDF 存 Vercel Blob，前台直接读 Blob 地址
import { APIError } from 'payload'
import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isContentRole, isLoggedIn } from '@/access'
import { at } from '@/fields'
import { blockReferencedMediaDelete } from '@/hooks/mediaGuard'
import { PATHS, revalidate } from '@/hooks/revalidate'
import { MEDIA_USAGES } from '@/lib/constants'

const MB = 1024 * 1024
const IMAGE_MAX = 20 * MB
const PDF_MAX = 30 * MB
// Vercel 图片优化要求源图宽高都不超过 8192 像素
const MAX_DIMENSION = 8192

const checkFile: CollectionBeforeChangeHook = ({ data }) => {
  if (typeof data?.alt === 'string' && /[㐀-鿿]/.test(data.alt)) {
    throw new APIError('替代文字会显示给海外访客和搜索引擎，请用英文填写', 400, null, true)
  }
  const mime = typeof data?.mimeType === 'string' ? data.mimeType : ''
  const size = typeof data?.filesize === 'number' ? data.filesize : 0
  if (mime.startsWith('image/') && size > IMAGE_MAX) throw new APIError('图片不能超过 20MB', 400, null, true)
  if (mime === 'application/pdf' && size > PDF_MAX) throw new APIError('PDF 不能超过 30MB', 400, null, true)
  if (
    mime.startsWith('image/') &&
    ((typeof data?.width === 'number' && data.width > MAX_DIMENSION) ||
      (typeof data?.height === 'number' && data.height > MAX_DIMENSION))
  ) {
    throw new APIError(`图片宽或高不能超过 ${MAX_DIMENSION} 像素，请缩小后再上传`, 400, null, true)
  }
  return data
}

// 修改替代文字、说明、焦点或替换文件后，引用它的静态页面要重新生成；用到的位置很多，直接刷新全站。
// 新上传的文件还没有页面引用，删除前又已确认没有引用，这两种情况不用刷新
const refreshAfterUpdate: CollectionAfterChangeHook = ({ doc, operation, req }) => {
  if (operation === 'update') revalidate(req, [PATHS.everything])
  return doc
}

// 没有配置 Blob 时（本地开发），文件由 Payload 自己提供，需要允许匿名读取
export const mediaPubliclyServedByPayload = !process.env.BLOB_READ_WRITE_TOKEN

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: '媒体', plural: '媒体库' },
  admin: {
    group: '媒体库',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'usage', 'filesize', 'updatedAt'],
    listSearchableFields: ['alt', 'filename', 'caption'],
  },
  access: {
    read: mediaPubliclyServedByPayload ? () => true : isLoggedIn,
    create: isContentRole,
    update: isContentRole,
    delete: isContentRole,
  },
  custom: mediaPubliclyServedByPayload ? { totp: { disableAccessWrapper: { read: true } } } : undefined,
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'],
    focalPoint: true,
    crop: false,
    adminThumbnail: 'thumbnail',
    // 只生成后台缩略图；前台尺寸交给 Vercel 图片优化（技术方案 5.4）
    imageSizes: [{ name: 'thumbnail', width: 400, withoutEnlargement: true }],
  },
  hooks: {
    beforeChange: [checkFile],
    afterChange: [refreshAfterUpdate],
    beforeDelete: [blockReferencedMediaDelete],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代文字',
      required: true,
      admin: { description: at('图片的替代文字：读屏软件朗读、图片加载失败时显示，搜索引擎也会读取', '必填，英文。描述图片内容，例如 “Latiao production line in a customer factory”；PDF 填文件标题') },
    },
    {
      name: 'usage',
      type: 'select',
      label: '用途',
      options: [...MEDIA_USAGES],
      defaultValue: 'other',
      admin: { description: at('不在前台显示', '便于在媒体库里筛选') },
    },
    { name: 'caption', type: 'text', label: '图片说明', admin: { description: at('图片放大层下方的说明（选填）') } },
    {
      name: 'licenseNote',
      type: 'textarea',
      label: '授权说明',
      custom: { allowChinese: true },
      admin: { description: at('不在前台显示', '记录图片来源和使用授权') },
    },
  ],
}
