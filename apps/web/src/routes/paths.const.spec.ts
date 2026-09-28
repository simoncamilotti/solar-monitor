import { RoutePaths } from './paths.const.js';

describe('RoutePaths', () => {
  it('should define the correct paths', () => {
    expect(RoutePaths.HOME).toBe('/');
  });
});
