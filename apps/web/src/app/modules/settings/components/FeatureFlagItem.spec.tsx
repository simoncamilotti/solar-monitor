import { fireEvent, render, screen } from '@testing-library/react';

import { FeatureFlagItem } from './FeatureFlagItem';

describe('FeatureFlagItem', () => {
  const handleToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display the flag key', () => {
    render(<FeatureFlagItem flag={{ key: 'projects', enabled: true }} handleToggle={handleToggle} />);

    expect(screen.getByText('projects')).toBeDefined();
  });

  it('should render a switch with aria-checked true when enabled', () => {
    render(<FeatureFlagItem flag={{ key: 'projects', enabled: true }} handleToggle={handleToggle} />);

    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('should render a switch with aria-checked false when disabled', () => {
    render(<FeatureFlagItem flag={{ key: 'blog', enabled: false }} handleToggle={handleToggle} />);

    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
  });

  it('should call handleToggle with the flag when clicking the switch', () => {
    const flag = { key: 'projects', enabled: true };
    render(<FeatureFlagItem flag={flag} handleToggle={handleToggle} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(handleToggle).toHaveBeenCalledWith(flag);
  });
});
