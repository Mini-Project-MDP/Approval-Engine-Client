import type { ReactNode } from 'react'
import { Card, Statistic } from 'antd'
import { color } from '../../theme/tokens'

interface StatCardProps {
  icon: ReactNode
  iconColor: string
  iconBg: string
  title: string
  value: string | number
  suffix?: string
  hint: string
}

export default function StatCard({ icon, iconColor, iconBg, title, value, suffix, hint }: StatCardProps) {
  return (
    <Card variant="borderless" style={{ border: `1px solid ${color.border}` }} styles={{ body: { padding: 20 } }}>
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[15px]"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </span>
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: color.textTertiary }}
        >
          {title}
        </span>
      </div>
      <Statistic
        value={value}
        suffix={suffix}
        valueStyle={{ fontSize: 26, fontWeight: 800, color: color.textPrimary, lineHeight: 1.1 }}
      />
      <p className="mt-1 text-xs" style={{ color: color.textTertiary }}>
        {hint}
      </p>
    </Card>
  )
}
