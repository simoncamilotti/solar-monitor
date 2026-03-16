import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockOnSubmit = vi.fn((e: Event) => e.preventDefault());

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../hooks/use-feature-flag-form.hook', () => ({
  useFeatureFlagForm: () => ({
    control: undefined,
    isValid: true,
    isPending: false,
    onSubmit: mockOnSubmit,
  }),
}));

vi.mock('react-hook-form', () => ({
  Controller: ({ render: renderFn, name }: any) =>
    renderFn({
      field: { name, value: '', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() },
      fieldState: {},
    }),
}));

import { FeatureFlagForm } from './FeatureFlagForm';

describe('FeatureFlagForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the input with placeholder', () => {
    render(<FeatureFlagForm />);

    expect(screen.getByPlaceholderText('featureFlags.placeholder')).toBeDefined();
  });

  it('should render the submit button', () => {
    render(<FeatureFlagForm />);

    expect(screen.getByText('featureFlags.add')).toBeDefined();
  });

  it('should render the key hint', () => {
    render(<FeatureFlagForm />);

    expect(screen.getByText('featureFlags.keyHint')).toBeDefined();
  });

  it('should call onSubmit when submitting the form', async () => {
    render(<FeatureFlagForm />);

    fireEvent.submit(screen.getByPlaceholderText('featureFlags.placeholder').closest('form')!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
