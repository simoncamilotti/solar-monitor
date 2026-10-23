import { render, screen } from '@testing-library/react';

import { i18n } from '../../../i18n/i18n.js';
import { SunShareCard } from './sun-share-card.js';

describe('SunShareCard', () => {
  it('should show the shares of production and consumption', () => {
    render(
      <SunShareCard
        split={{ produced: 20, consumed: 16, selfConsumed: 10, imported: 6, exported: 10 }}
      />,
    );

    expect(screen.getByText(i18n.t('home.sunShare.usedOnSite'))).toBeDefined();
    // 10 of 20 produced used on site; 10 of 16 consumed covered by the sun.
    expect(screen.getAllByText('50 %')).toHaveLength(2);
    expect(screen.getByText('63 %')).toBeDefined();
    expect(screen.getByText('37 %')).toBeDefined();
  });

  it('should say so when the period is empty', () => {
    render(
      <SunShareCard
        split={{ produced: 0, consumed: 0, selfConsumed: 0, imported: 0, exported: 0 }}
      />,
    );

    expect(screen.getByText(i18n.t('home.sunShare.empty'))).toBeDefined();
  });
});
