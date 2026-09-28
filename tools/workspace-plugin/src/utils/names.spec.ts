import { assertKebabCase, toDisplayName } from './names.ts';

describe('assertKebabCase', () => {
  it.each(['app', 'solar-monitor', 'app2', 'a1-b2'])('accepts %s', (name) => {
    expect(() => assertKebabCase(name, 'name')).not.toThrow();
  });

  it.each(['', 'App', '2app', 'solar_monitor', 'solar--monitor', 'solar-', 'a'.repeat(41)])(
    'rejects "%s"',
    (name) => {
      expect(() => assertKebabCase(name, 'name')).toThrow(/Invalid name/);
    },
  );
});

describe('toDisplayName', () => {
  it('capitalizes each word', () => {
    expect(toDisplayName('solar-monitor')).toBe('Solar Monitor');
  });
});
