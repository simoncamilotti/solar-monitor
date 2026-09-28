import { useEnphaseGetAll } from '@repo/api-client';

export const useHistoryData = () => {
  const { data, isPending, isError } = useEnphaseGetAll({
    query: { staleTime: 1000 * 60 * 60 }, // 1 hour
  });

  return {
    data,
    isPending,
    isError,
  };
};
