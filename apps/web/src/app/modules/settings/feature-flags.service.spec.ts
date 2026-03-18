vi.mock('../api/axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import { axiosInstance } from '../api/axiosInstance';
import { FeatureFlagsService } from './feature-flags.service';

const mockedAxios = vi.mocked(axiosInstance);

describe('FeatureFlagsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call axiosInstance.get with feature-flags and return data', async () => {
      const flags = [
        { key: 'projects', enabled: true },
        { key: 'blog', enabled: false },
      ];
      mockedAxios.get.mockResolvedValue({ data: flags });

      const result = await FeatureFlagsService.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('feature-flags');
      expect(result).toEqual(flags);
    });
  });

  describe('create', () => {
    it('should call axiosInstance.post with correct params and return data', async () => {
      const flag = { key: 'new-flag', enabled: true };
      mockedAxios.post.mockResolvedValue({ data: flag });

      const result = await FeatureFlagsService.create('new-flag', true);

      expect(mockedAxios.post).toHaveBeenCalledWith('feature-flags', { key: 'new-flag', enabled: true });
      expect(result).toEqual(flag);
    });
  });

  describe('update', () => {
    it('should call axiosInstance.patch with correct URL and body and return data', async () => {
      const flag = { key: 'projects', enabled: false };
      mockedAxios.patch.mockResolvedValue({ data: flag });

      const result = await FeatureFlagsService.update('projects', false);

      expect(mockedAxios.patch).toHaveBeenCalledWith('feature-flags/projects', { enabled: false });
      expect(result).toEqual(flag);
    });
  });
});
