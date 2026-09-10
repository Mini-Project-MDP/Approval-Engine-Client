import { color } from '../../theme/tokens'

interface BrandMarkProps {
  size?: number
}

/** Geometric monogram — an "A" built from three ascending bars, echoing an
 * approval checkmark/chain without leaning on a stock icon. */
export default function BrandMark({ size = 36 }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="10" fill={color.brand} />
      <rect x="10" y="20" width="4" height="8" rx="1.5" fill="white" fillOpacity="0.55" />
      <rect x="16" y="14" width="4" height="14" rx="1.5" fill="white" fillOpacity="0.78" />
      <rect x="22" y="8" width="4" height="20" rx="1.5" fill="white" />
    </svg>
  )
}
