'use client'
// 备份记录的下载按钮，调用 6.6 节接口（需要管理员并通过双重验证）
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

type Row = { id?: number | string; kind?: string; status?: string }

function DownloadLink({ row }: { row: Row }) {
  if (!row.id || row.kind !== 'database' || row.status !== 'success') return <span>—</span>
  return (
    <a href={`/api/backups/${row.id}/download`} className="jk-link" onClick={(e) => e.stopPropagation()}>
      下载
    </a>
  )
}

export function BackupDownloadCell({ rowData }: { rowData?: Row }) {
  return <DownloadLink row={rowData ?? {}} />
}

export function BackupDownloadField() {
  const { id } = useDocumentInfo()
  const kind = useFormFields(([fields]) => fields.kind?.value as string | undefined)
  const status = useFormFields(([fields]) => fields.status?.value as string | undefined)
  return (
    <div className="jk-backup-download">
      <p>下载的是加密后的文件，需要用备份密钥和 scripts/decrypt-backup.ts 解密（恢复步骤见技术方案 9.2 节）。</p>
      <DownloadLink row={{ id, kind, status }} />
    </div>
  )
}
