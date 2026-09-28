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
  backgroundColor: 'hsl(240 14% 6%)',
  foregroundColor: 'hsl(240 10% 93%)',
  headerTextColor: 'hsl(240 5% 50%)',
  borderColor: 'hsl(240 10% 13%)',
  rowHoverColor: 'hsl(240 12% 10%)',
  selectedRowBackgroundColor: 'hsl(245 58% 61% / 0.1)',
  ...defaultTheme,
});

export const agThemeLight = themeQuartz.withParams({
  backgroundColor: 'hsl(270, 20%, 100%)',
  foregroundColor: 'hsl(270, 50%, 10%)',
  headerBackgroundColor: 'hsl(270, 15%, 94%)',
  headerTextColor: 'hsl(270 5% 50%)',
  borderColor: 'hsl(270 50% 90%)',
  rowHoverColor: 'hsl(280, 80%, 60%, 0.08)',
  selectedRowBackgroundColor: 'hsl(275 58% 61% / 0.1)',
  ...defaultTheme,
});
