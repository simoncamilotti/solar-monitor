import { routes } from './routes';

vi.mock('../modules/auth/auth', () => ({
  isAuthenticated: vi.fn(),
  login: vi.fn(),
}));

describe('routes', () => {
  it('should define a root layout route', () => {
    expect(routes[0].element).toBeDefined();
  });

  it('should have a loader on the root route for auth', () => {
    expect(routes[0].loader).toBeDefined();
  });

  it('should define the home route as a child', () => {
    const children = routes[0].children!;
    const homeRoute = children.find(r => r.path === '/');

    expect(homeRoute).toBeDefined();
    expect(homeRoute!.element).toBeDefined();
  });

  it('should define the settings route as a child', () => {
    const children = routes[0].children!;
    const settingsRoute = children.find(r => r.path?.includes('settings'));

    expect(settingsRoute).toBeDefined();
    expect(settingsRoute!.element).toBeDefined();
  });

  it('should define a catch-all redirect route', () => {
    const catchAll = routes.find(r => r.path === '*');

    expect(catchAll).toBeDefined();
    expect(catchAll!.loader).toBeDefined();
  });
});
