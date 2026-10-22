// 获取 Payload 本地接口实例（服务端使用）
import config from '@payload-config'
import { getPayload } from 'payload'

export const getPayloadClient = () => getPayload({ config })
