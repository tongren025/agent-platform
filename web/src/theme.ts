import type { ThemeConfig } from 'antd';

export const COLORS = {
  ink: '#0f0f23',
  inkLight: '#1a1a3e',
  iris: '#6366f1',
  irisLight: '#818cf8',
  irisMuted: 'rgba(99, 102, 241, 0.12)',
  canvas: '#f7f8fc',
  mint: '#10b981',
  rose: '#f43f5e',
  slate: '#64748b',
  slateDark: '#334155',
  border: '#e8ecf4',
  white: '#ffffff',
};

export const theme: ThemeConfig = {
  token: {
    colorPrimary: COLORS.iris,
    colorSuccess: COLORS.mint,
    colorError: COLORS.rose,
    colorBgLayout: COLORS.canvas,
    colorBgContainer: COLORS.white,
    colorBorder: COLORS.border,
    colorBorderSecondary: '#f0f1f5',
    borderRadius: 10,
    borderRadiusLG: 14,
    fontFamily:
      "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    colorText: '#1e293b',
    colorTextSecondary: COLORS.slate,
    controlHeight: 38,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    boxShadowSecondary: '0 4px 12px rgba(0,0,0,0.06)',
  },
  components: {
    Layout: {
      siderBg: COLORS.ink,
      bodyBg: COLORS.canvas,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: COLORS.irisMuted,
      darkItemSelectedColor: COLORS.irisLight,
      darkItemColor: 'rgba(255,255,255,0.55)',
      darkItemHoverColor: 'rgba(255,255,255,0.85)',
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      iconSize: 18,
      itemHeight: 42,
    },
    Card: {
      borderRadiusLG: 14,
      boxShadowTertiary: '0 1px 3px rgba(0,0,0,0.04)',
    },
    Button: {
      borderRadius: 8,
      primaryShadow: '0 2px 8px rgba(99,102,241,0.25)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8f9fc',
      headerColor: COLORS.slateDark,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
  },
};
