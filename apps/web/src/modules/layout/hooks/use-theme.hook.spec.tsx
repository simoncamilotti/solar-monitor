import { ThemeProvider } from '@repo/ui/components/theme-provider';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useTheme } from './use-theme.hook.js';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
);

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should default to the dark theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should read the theme from localStorage', () => {
    localStorage.setItem('theme', 'light');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('light');
  });

  it('should toggle between dark and light and store the choice', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should resolve the system theme', () => {
    localStorage.setItem('theme', 'system');
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
  });
});
