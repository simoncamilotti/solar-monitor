import { Test } from '@nestjs/testing';
import { PricingController } from './pricing.controller.js';
import { PricingService } from './pricing.service.js';

const mockPricing = {
  findTariffs: vi.fn(),
  createTariff: vi.fn(),
  deleteTariff: vi.fn(),
  getInstallation: vi.fn(),
  updateInstallation: vi.fn(),
};

const tariff = {
  id: '0b5c8c3e-5d2a-4a59-9a59-3f1f5c1e2a11',
  kind: 'purchase' as const,
  pricePerKwh: 0.2516,
  effectiveFrom: '2025-02-01',
};

describe('PricingController', () => {
  let controller: PricingController;

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [PricingController],
      providers: [{ provide: PricingService, useValue: mockPricing }],
    }).compile();
    controller = moduleRef.get(PricingController);
  });

  it('should list the tariffs', async () => {
    mockPricing.findTariffs.mockResolvedValue([tariff]);

    await expect(controller.findTariffs()).resolves.toEqual([tariff]);
  });

  it('should create a tariff', async () => {
    mockPricing.createTariff.mockResolvedValue(tariff);
    const dto = { kind: 'purchase' as const, pricePerKwh: 0.2516, effectiveFrom: '2025-02-01' };

    await expect(controller.createTariff(dto)).resolves.toEqual(tariff);
    expect(mockPricing.createTariff).toHaveBeenCalledWith(dto);
  });

  it('should delete a tariff', async () => {
    mockPricing.deleteTariff.mockResolvedValue(undefined);

    await controller.deleteTariff(tariff.id);
    expect(mockPricing.deleteTariff).toHaveBeenCalledWith(tariff.id);
  });

  it('should read and update the installation', async () => {
    mockPricing.getInstallation.mockResolvedValue({ cost: null });
    mockPricing.updateInstallation.mockResolvedValue({ cost: 9500 });

    await expect(controller.getInstallation()).resolves.toEqual({ cost: null });
    await expect(controller.updateInstallation({ cost: 9500 })).resolves.toEqual({ cost: 9500 });
  });
});
