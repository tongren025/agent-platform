// 全局配色常量 COLORS + antd 主题定制（主色/圆角/组件级覆盖）。
import type { ThemeConfig } from 'antd';

export const COLORS = {
  ink: '#25251f',
  inkLight: '#35342d',
  iris: '#806146',
  irisLight: '#a48466',
  irisMuted: 'rgba(128, 97, 70, 0.11)',
  canvas: '#f6f4ef',
  mint: '#5f7d68',
  rose: '#b05248',
  slate: '#77756d',
  info: '#607c88',
  warning: '#a77536',
  slateDark: '#45443e',
  border: '#e4e0d8',
  white: '#ffffff',
};

export const theme: ThemeConfig = {
  token: {
    colorPrimary: COLORS.iris,
    colorSuccess: COLORS.mint,
    colorError: COLORS.rose,
    colorInfo: COLORS.info,
    colorWarning: COLORS.warning,
    colorBgLayout: COLORS.canvas,
    colorBgContainer: COLORS.white,
    colorBorder: COLORS.border,
    colorBorderSecondary: '#eeebe5',
    borderRadius: 10,
    borderRadiusLG: 16,
    fontFamily:
      "'Inter', 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    colorText: COLORS.ink,
    colorTextSecondary: COLORS.slate,
    controlHeight: 40,
    controlOutline: 'rgba(128, 97, 70, 0.16)',
    boxShadow: '0 1px 2px rgba(48,44,35,0.035)',
    boxShadowSecondary: '0 12px 32px rgba(48,44,35,0.075)',
  },
  components: {
    Layout: {
      siderBg: COLORS.ink,
      bodyBg: COLORS.canvas,
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemSelectedBg: COLORS.irisMuted,
      itemSelectedColor: COLORS.iris,
      itemColor: COLORS.slate,
      itemHoverColor: COLORS.ink,
      itemHoverBg: 'rgba(255,255,255,0.72)',
      itemBorderRadius: 11,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      iconSize: 17,
      itemHeight: 42,
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: '0 3px 12px rgba(48,44,35,0.035)',
    },
    Button: {
      borderRadius: 10,
      primaryShadow: '0 2px 5px rgba(91,67,46,0.10)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f7f5f1',
      headerColor: COLORS.slateDark,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Input: {
      borderRadius: 10,
    },
    Select: {
      borderRadius: 10,
    },
  },
};
