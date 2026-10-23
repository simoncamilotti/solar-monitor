import { Test } from '@nestjs/testing';
import { DateRangesController } from './date-ranges.controller.js';
import { DateRangesService } from './date-ranges.service.js';

const mockDateRanges = {
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const range = {
  id: '0b5c8c3e-5d2a-4a59-9a59-3f1f5c1e2a11',
  name: 'Été 2024',
  startDate: '2024-06-21',
  endDate: '2024-09-22',
};

describe('DateRangesController', () => {
  let controller: DateRangesController;

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [DateRangesController],
      providers: [{ provide: DateRangesService, useValue: mockDateRanges }],
    }).compile();
    controller = moduleRef.get(DateRangesController);
  });

  it('should list the saved ranges', async () => {
    mockDateRanges.findAll.mockResolvedValue([range]);

    await expect(controller.findAll()).resolves.toEqual([range]);
  });

  it('should save a range', async () => {
    mockDateRanges.create.mockResolvedValue(range);
    const dto = { name: range.name, startDate: range.startDate, endDate: range.endDate };

    await expect(controller.create(dto)).resolves.toEqual(range);
    expect(mockDateRanges.create).toHaveBeenCalledWith(dto);
  });

  it('should update a range', async () => {
    mockDateRanges.update.mockResolvedValue({ ...range, name: 'Vacances' });

    await expect(controller.update(range.id, { name: 'Vacances' })).resolves.toMatchObject({
      name: 'Vacances',
    });
    expect(mockDateRanges.update).toHaveBeenCalledWith(range.id, { name: 'Vacances' });
  });

  it('should delete a range', async () => {
    mockDateRanges.delete.mockResolvedValue(undefined);

    await controller.delete(range.id);
    expect(mockDateRanges.delete).toHaveBeenCalledWith(range.id);
  });
});
