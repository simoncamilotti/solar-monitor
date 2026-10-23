import { Loader2, Save, Wallet } from 'lucide-react';
import { type FormEvent, type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePricingGetInstallation } from '@repo/api-client';
import { installationSchema } from '@repo/contracts';

import { useUpdateInstallationMutation } from '../hooks/use-tariff-mutations.hook.js';

export const InstallationCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const { data, isPending, isError } = usePricingGetInstallation();
  const mutation = useUpdateInstallationMutation();
  // The stored cost until the user edits it.
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? (data?.cost == null ? '' : String(data.cost));

  const parsed = installationSchema.safeParse({
    // An empty field clears the cost; the decimal comma of French users is accepted.
    cost: value.trim() === '' ? null : Number(value.replace(',', '.')),
  });
  const hasChanged = draft !== null && parsed.success && parsed.data.cost !== (data?.cost ?? null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!parsed.success) return;
    mutation.mutate(
      { data: parsed.data },
      {
        onSuccess: () => {
          toast.success(t('installation.success'));
          setDraft(null);
        },
        onError: () => toast.error(t('installation.error')),
      },
    );
  };

  if (isPending) {
    return <div className="h-24 bg-muted animate-pulse rounded-xl" />;
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground mb-1">{t('installation.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('installation.description')}</p>
      </div>

      {isError && <p className="text-destructive text-sm">{t('installation.loadError')}</p>}

      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card"
      >
        <div className="flex items-center gap-3">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <label htmlFor="installation-cost" className="text-sm font-medium text-foreground">
            {t('installation.cost')}
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="installation-cost"
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setDraft(e.target.value)}
            className="w-32 px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground tabular-nums"
          />
          <button
            type="submit"
            disabled={mutation.isPending || !hasChanged}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 rounded-lg border border-border bg-card"
          >
            {mutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {t('installation.save')}
          </button>
        </div>
      </form>
    </div>
  );
};
