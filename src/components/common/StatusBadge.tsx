import { Tag } from 'antd'
import { statusVisual } from '../../utils/status'

export default function StatusBadge({ status }: { status: string }) {
  const v = statusVisual(status)
  return (
    <Tag
      style={{
        color: v.color,
        background: v.bg,
        border: 'none',
        borderRadius: 999,
        fontWeight: 600,
        fontSize: 12,
        padding: '1px 10px',
        margin: 0,
      }}
    >
      {v.label}
    </Tag>
  )
}
