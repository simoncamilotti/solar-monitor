import { themeQuartz } from 'ag-grid-community';

const defaultTheme = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  headerFontSize: 12,
  headerFontWeight: 500,
  columnBorder: false,
  wrapperBorderRadius: 12,
  cellHorizontalPadding: 16,
};

export const agThemeDark = themeQuartz.withParams({
  backgroundColor: '#1a1713',
  foregroundColor: '#f5f0e6',
  headerBackgroundColor: '#24201b',
  headerTextColor: '#a8a29e',
  borderColor: '#2c2721',
  rowHoverColor: 'rgba(251, 191, 36, 0.06)',
  selectedRowBackgroundColor: 'rgba(251, 191, 36, 0.12)',
  ...defaultTheme,
});

export const agThemeLight = themeQuartz.withParams({
  backgroundColor: '#ffffff',
  foregroundColor: '#1c1917',
  headerBackgroundColor: '#f0ece4',
  headerTextColor: '#6b645d',
  borderColor: '#e7e2d8',
  rowHoverColor: 'rgba(245, 158, 11, 0.06)',
  selectedRowBackgroundColor: 'rgba(245, 158, 11, 0.12)',
  ...defaultTheme,
});
