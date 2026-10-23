import {
  getDateRangesFindAllQueryKey,
  useDateRangesCreate,
  useDateRangesDelete,
  useDateRangesUpdate,
} from '@repo/api-client';
import { useQueryClient } from '@tanstack/react-query';

const useInvalidateRanges = () => {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: getDateRangesFindAllQueryKey() });
};

export const useCreateDateRangeMutation = () =>
  useDateRangesCreate({ mutation: { onSuccess: useInvalidateRanges() } });

export const useUpdateDateRangeMutation = () =>
  useDateRangesUpdate({ mutation: { onSuccess: useInvalidateRanges() } });

export const useDeleteDateRangeMutation = () =>
  useDateRangesDelete({ mutation: { onSuccess: useInvalidateRanges() } });
