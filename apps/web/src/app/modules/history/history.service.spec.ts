vi.mock('../api/axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
  },
}));

import { axiosInstance } from '../api/axiosInstance';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call the correct API endpoint', async () => {
      const mockData = [{ date: '2024-01-01', kwhProduced: 10 }];
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockData });

      await HistoryService.getAll();

      expect(axiosInstance.get).toHaveBeenCalledWith('enphase/all');
    });

    it('should return data from response', async () => {
      const mockData = [
        { date: '2024-01-01', kwhProduced: 10, kwhConsumed: 8, kwhImported: 2, kwhExported: 4, gridDependency: 20 },
      ];
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockData });

      const result = await HistoryService.getAll();

      expect(result).toEqual(mockData);
    });

    it('should propagate errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(HistoryService.getAll()).rejects.toThrow('Network error');
    });
  });
});
