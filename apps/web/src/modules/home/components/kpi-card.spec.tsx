import { render, screen } from '@testing-library/react';
import { Zap } from 'lucide-react';

import { i18n } from '../../../i18n/i18n.js';
import { KPICard } from './kpi-card.js';

describe('KPICard', () => {
  it('should show an energy delta as a percentage', () => {
    render(<KPICard title="Production" value="10.0" unit="kWh" delta={-12.5} icon={Zap} />);

    expect(screen.getByText(/^12,5\s%$/)).toBeDefined();
  });

  it('should show a rate delta in points', () => {
    render(
      <KPICard title="Autonomie" value="80.0" unit="%" delta={3} deltaUnit="points" icon={Zap} />,
    );

    expect(screen.getByText('3,0 pts')).toBeDefined();
  });

  it('should explain that there is no previous period when the delta is missing', () => {
    render(<KPICard title="Production" value="113.0" unit="kWh" delta={null} icon={Zap} />);

    expect(screen.getByText(i18n.t('home.kpi.noPrevious'))).toBeDefined();
    expect(screen.queryByText(i18n.t('home.kpi.vsPrevious'))).toBeNull();
  });

  it('should compare with the previous period when the delta is known', () => {
    render(<KPICard title="Production" value="113.0" unit="kWh" delta={12.5} icon={Zap} />);

    expect(screen.getByText(i18n.t('home.kpi.vsPrevious'))).toBeDefined();
    expect(screen.queryByText(i18n.t('home.kpi.noPrevious'))).toBeNull();
  });
});
