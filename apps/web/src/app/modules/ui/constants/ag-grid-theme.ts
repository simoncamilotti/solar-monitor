import { themeQuartz } from 'ag-grid-community';

export const agTheme = themeQuartz.withParams({
  backgroundColor: 'hsl(240 14% 6%)',
  foregroundColor: 'hsl(240 10% 93%)',
  headerTextColor: 'hsl(240 5% 50%)',
  borderColor: 'hsl(240 10% 13%)',
  rowHoverColor: 'hsl(240 12% 10%)',
  selectedRowBackgroundColor: 'hsl(245 58% 61% / 0.1)',
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  headerFontSize: 12,
  headerFontWeight: 500,
  columnBorder: false,
  wrapperBorderRadius: 12,
  cellHorizontalPadding: 16,
});
