export const RoutePathParams = {} as const;

export const RoutePaths = {
  HOME: '/',
  SETTINGS: '/settings',
  ERROR_FORBIDDEN: '/forbidden',
} as const;

export const RouteNames = {
  HOME: 'nav.home',
  SETTINGS: 'nav.settings',
} as const;

export const findPathFromName = (name: string) => {
  const keys = Object.keys(RouteNames);
  const values = Object.values(RouteNames);

  const arr = keys.reduce((acc: Array<{ key: string; name: string }>, item, idx) => {
    acc.push({ key: item, name: values[idx] });

    return acc;
  }, []);

  const keyPath = arr.find(x => x.name === name)?.key || 'HOME';

  return RoutePaths[keyPath as keyof typeof RouteNames];
};
