import { useContext } from 'react';

import { ThemeContext } from '../providers/theme-provider.js';

export const useTheme = () => useContext(ThemeContext);
