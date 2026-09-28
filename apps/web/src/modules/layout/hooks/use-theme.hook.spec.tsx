import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { ThemeProvider } from '../providers/theme-provider.js';
import { useTheme } from './use-theme.hook.js';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should return theme and toggleTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
    expect(typeof result.current.toggleTheme).toBe('function');
  });
});
