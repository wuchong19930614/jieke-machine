// 备份文件加密：gzip 压缩后用 AES-256-GCM 加密（技术方案 9.2）。
// 文件格式：5 字节标识 JKBK1 + 12 字节 IV + 密文 + 16 字节认证标签
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { Transform } from 'node:stream'
import { gunzipSync } from 'node:zlib'

const MAGIC = Buffer.from('JKBK1')
const IV_LENGTH = 12
const TAG_LENGTH = 16

export function backupKey(hex = process.env.BACKUP_ENCRYPTION_KEY): Buffer {
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) throw new Error('BACKUP_ENCRYPTION_KEY 必须是 64 位十六进制字符（32 字节）')
  return Buffer.from(hex, 'hex')
}

// 加密流：输出 标识 + IV + 密文，结束时追加认证标签
export function encryptStream(key: Buffer): Transform {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  let headerSent = false
  return new Transform({
    transform(chunk, _encoding, callback) {
      const out = cipher.update(chunk)
      if (!headerSent) {
        headerSent = true
        callback(null, Buffer.concat([MAGIC, iv, out]))
      } else callback(null, out)
    },
    flush(callback) {
      const final = cipher.final()
      const tag = cipher.getAuthTag()
      callback(null, headerSent ? Buffer.concat([final, tag]) : Buffer.concat([MAGIC, iv, final, tag]))
    },
  })
}

// 解密整个备份文件，返回解压后的 SQL 文本
export function decryptBackup(file: Buffer, key: Buffer): string {
  if (file.length < MAGIC.length + IV_LENGTH + TAG_LENGTH || !file.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error('不是本网站生成的备份文件')
  }
  const iv = file.subarray(MAGIC.length, MAGIC.length + IV_LENGTH)
  const tag = file.subarray(file.length - TAG_LENGTH)
  const data = file.subarray(MAGIC.length + IV_LENGTH, file.length - TAG_LENGTH)
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const gz = Buffer.concat([decipher.update(data), decipher.final()])
  return gunzipSync(gz).toString('utf8')
}
