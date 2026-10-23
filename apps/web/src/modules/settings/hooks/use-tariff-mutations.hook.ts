import {
  getPricingFindTariffsQueryKey,
  getPricingGetInstallationQueryKey,
  usePricingCreateTariff,
  usePricingDeleteTariff,
  usePricingUpdateInstallation,
} from '@repo/api-client';
import { useQueryClient } from '@tanstack/react-query';

const useInvalidate = (queryKey: readonly unknown[]) => {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey });
};

export const useCreateTariffMutation = () =>
  usePricingCreateTariff({
    mutation: { onSuccess: useInvalidate(getPricingFindTariffsQueryKey()) },
  });

export const useDeleteTariffMutation = () =>
  usePricingDeleteTariff({
    mutation: { onSuccess: useInvalidate(getPricingFindTariffsQueryKey()) },
  });

export const useUpdateInstallationMutation = () =>
  usePricingUpdateInstallation({
    mutation: { onSuccess: useInvalidate(getPricingGetInstallationQueryKey()) },
  });
