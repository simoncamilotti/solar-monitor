import { act, fireEvent, render, screen } from '@testing-library/react';
import { useContext } from 'react';

import { ThemeContext, ThemeProvider } from './ThemeProvider';

const ThemeConsumer = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button data-testid="toggle" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should render children', () => {
    render(
      <ThemeProvider>
        <span data-testid="child">Hello</span>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('should default to dark theme when localStorage is empty', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('should read theme from localStorage', () => {
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should add dark class to document.documentElement when theme is dark', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class when theme is light', () => {
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should toggle theme from dark to light', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');

    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should store theme in localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    expect(localStorage.getItem('theme')).toBe('light');
  });
});
