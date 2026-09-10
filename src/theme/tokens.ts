// Design tokens for the Approval Engine portal — Mayora's red/white corporate
// identity, executed with restraint (Operate mode: brand lives in precise
// details, not decoration). Single source of truth for both the antd theme
// (theme/antdTheme.ts) and any place Tailwind/CSS needs the same values.

export const color = {
  brand: '#AF123B',
  brandHover: '#8F0F31',
  brandActive: '#7A0C29',
  brandTint: '#FDF1F4', // active-nav pill / soft highlight background
  brandBorder: '#F3D3DC',

  success: '#187447',
  successTint: '#EDFAF3',
  warning: '#946200',
  warningTint: '#FEF6E9',
  info: '#3B6FD9',
  infoTint: '#EEF3FD',
  danger: '#C81E3A',

  bg: '#F5F6F8',
  surface: '#FFFFFF', // cards, sidebar, header
  border: '#DFE3E8',
  borderStrong: '#B9C1CC',

  textPrimary: '#202B3C',
  textSecondary: '#526071',
  textTertiary: '#626E7D',
} as const

export const fontFamily = {
  sans: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
} as const
