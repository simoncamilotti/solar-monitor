import { Test, TestingModule } from '@nestjs/testing';

import { FeatureFlagService } from '../services/feature-flag.service';
import { FeatureFlagController } from './feature-flag.controller';

const mockFeatureFlagService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('FeatureFlagController', () => {
  let controller: FeatureFlagController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeatureFlagController],
      providers: [{ provide: FeatureFlagService, useValue: mockFeatureFlagService }],
    }).compile();

    controller = module.get<FeatureFlagController>(FeatureFlagController);
  });

  describe('findAll', () => {
    it('should return all feature flags', async () => {
      const flags = [
        { key: 'projects', enabled: true },
        { key: 'blog', enabled: false },
      ];
      mockFeatureFlagService.findAll.mockResolvedValue(flags);

      const result = await controller.findAll();

      expect(result).toEqual(flags);
      expect(mockFeatureFlagService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create feature flag', async () => {
      const created = { key: 'blog', enabled: true };
      mockFeatureFlagService.create.mockResolvedValue(created);

      const result = await controller.create({ key: 'blog', enabled: true });

      expect(result).toEqual(created);
      expect(mockFeatureFlagService.create).toHaveBeenCalledWith({ key: 'blog', enabled: true });
    });
  });

  describe('update', () => {
    it('should delegate to service with key and dto', async () => {
      const updated = { key: 'projects', enabled: true };
      mockFeatureFlagService.update.mockResolvedValue(updated);

      const result = await controller.update('projects', { enabled: true });

      expect(result).toEqual(updated);
      expect(mockFeatureFlagService.update).toHaveBeenCalledWith('projects', { enabled: true });
    });

    it('should propagate errors from service', async () => {
      mockFeatureFlagService.update.mockRejectedValue(new Error('DB error'));

      await expect(controller.update('projects', { enabled: true })).rejects.toThrow('DB error');
    });
  });
});
