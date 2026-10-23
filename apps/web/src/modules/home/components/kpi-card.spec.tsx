import { render, screen } from '@testing-library/react';
import { Zap } from 'lucide-react';

import { KPICard } from './kpi-card.js';

describe('KPICard', () => {
  it('should show an energy delta as a percentage', () => {
    render(<KPICard title="Production" value="10.0" unit="kWh" delta={-12.5} icon={Zap} />);

    expect(screen.getByText('12.5%')).toBeDefined();
  });

  it('should show a rate delta in points', () => {
    render(
      <KPICard title="Autonomie" value="80.0" unit="%" delta={3} deltaUnit="points" icon={Zap} />,
    );

    expect(screen.getByText('3.0 pts')).toBeDefined();
  });
});
