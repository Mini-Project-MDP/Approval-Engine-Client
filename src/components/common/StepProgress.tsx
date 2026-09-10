import { color } from '../../theme/tokens'

interface StepProgressProps {
  /** 1-indexed current step. */
  current: number
  total: number
}

/** A compact row of dots showing how far a request has moved through its
 * workflow — filled brand-red up to the current step, hollow after. */
export default function StepProgress({ current, total }: StepProgressProps) {
  if (total <= 0) return null
  return (
    <div className="flex items-center gap-1" aria-label={`Langkah ${current} dari ${total}`}>
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <span
          key={step}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: step <= current ? color.brand : color.border }}
        />
      ))}
      <span className="ml-1.5 text-xs font-medium" style={{ color: color.textTertiary }}>
        {current}/{total}
      </span>
    </div>
  )
}
