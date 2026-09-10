import type { ThemeConfig } from 'antd'
import { color, fontFamily, radius } from './tokens'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: color.brand,
    colorInfo: color.info,
    colorTextSecondary: color.textSecondary,
    colorTextTertiary: color.textTertiary,
    colorTextPlaceholder: color.textTertiary,
    // colorInfo deliberately NOT tied to the brand red: an "info" banner
    // (e.g. the onboarding explainer) needs to read as calm/neutral, not as
    // an alert — reusing brand red there made a friendly tip look urgent.
    colorSuccess: color.success,
    colorSuccessBg: color.successTint,
    colorSuccessText: color.success,
    colorWarning: color.warning,
    colorWarningBg: color.warningTint,
    colorWarningText: color.warning,
    colorError: color.danger,
    colorLink: color.brand,
    colorTextBase: color.textPrimary,
    colorBgLayout: color.bg,
    colorBgContainer: color.surface,
    colorBorder: color.borderStrong,
    colorBorderSecondary: color.border,
    fontFamily: fontFamily.sans,
    fontSize: 14,
    controlHeight: 40,
    borderRadius: radius.sm,
    borderRadiusLG: radius.md,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: color.surface,
      headerBg: color.surface,
      bodyBg: color.bg,
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: color.textSecondary,
      itemHoverBg: color.bg,
      itemHoverColor: color.textPrimary,
      itemSelectedBg: color.brandTint,
      itemSelectedColor: color.brand,
      itemBorderRadius: radius.sm,
      itemHeight: 40,
      iconSize: 17,
      collapsedIconSize: 17,
    },
    Button: {
      controlHeight: 40,
      fontWeight: 600,
      primaryShadow: 'none',
      borderRadius: radius.sm,
    },
    Card: {
      borderRadiusLG: radius.md,
      boxShadowTertiary: 'none',
    },
    Table: {
      headerBg: '#F7F8FA',
      headerColor: color.textSecondary,
      rowHoverBg: color.bg,
      borderColor: color.border,
    },
    Tag: {
      borderRadiusSM: radius.sm,
    },
    Input: {
      controlHeight: 40,
      borderRadius: radius.sm,
    },
    Select: {
      controlHeight: 40,
      borderRadius: radius.sm,
    },
    Statistic: {
      titleFontSize: 12,
      contentFontSize: 28,
    },
  },
}
