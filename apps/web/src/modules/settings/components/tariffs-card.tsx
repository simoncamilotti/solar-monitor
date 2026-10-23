import { parseISO } from 'date-fns';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, type FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ApiError, usePricingFindTariffs } from '@repo/api-client';
import { type Tariff, type TariffKind, tariffCreateSchema } from '@repo/contracts';

import { tariffKindKey } from '../../../i18n/keys.js';
import { formatTariffPrice } from '../../savings/format-currency.js';
import {
  useCreateTariffMutation,
  useDeleteTariffMutation,
} from '../hooks/use-tariff-mutations.hook.js';

const KINDS: TariffKind[] = ['purchase', 'feedIn'];

export const TariffsCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const { data, isPending, isError } = usePricingFindTariffs();

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-medium text-foreground mb-1">{t('tariffs.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('tariffs.description')}</p>
      </div>

      {isPending && <div className="h-32 bg-muted animate-pulse rounded-xl" />}
      {isError && <p className="text-destructive text-sm">{t('tariffs.loadError')}</p>}

      {data && (
        <div className="p-4 rounded-xl border border-border/50 bg-card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {KINDS.map((kind) => (
              <TariffList key={kind} kind={kind} tariffs={data.filter((x) => x.kind === kind)} />
            ))}
          </div>
          <TariffForm />
        </div>
      )}
    </div>
  );
};

const TariffList: FunctionComponent<{ kind: TariffKind; tariffs: Tariff[] }> = ({
  kind,
  tariffs,
}) => {
  const { t, i18n } = useTranslation();
  const mutation = useDeleteTariffMutation();
  const dateFormat = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' });

  const handleDelete = (id: string) => {
    mutation.mutate(
      { id },
      {
        onSuccess: () => toast.success(t('tariffs.deleteSuccess')),
        onError: () => toast.error(t('tariffs.deleteError')),
      },
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground">{t(tariffKindKey(kind))}</h3>
      {tariffs.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('tariffs.none')}</p>
      ) : (
        <ul className="space-y-1">
          {/* Newest first: the price in force today leads. */}
          {tariffs.toReversed().map((tariff) => (
            <li key={tariff.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {t('tariffs.since', { date: dateFormat.format(parseISO(tariff.effectiveFrom)) })}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-medium tabular-nums">
                  {t('tariffs.perKwh', {
                    price: formatTariffPrice(tariff.pricePerKwh, i18n.language),
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(tariff.id)}
                  disabled={mutation.isPending}
                  aria-label={t('tariffs.delete')}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TariffForm: FunctionComponent = () => {
  const { t } = useTranslation();
  const mutation = useCreateTariffMutation();
  const [kind, setKind] = useState<TariffKind>('purchase');
  const [price, setPrice] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');

  const parsed = tariffCreateSchema.safeParse({
    kind,
    // Accept the decimal comma typed by French users.
    pricePerKwh: price.trim() === '' ? Number.NaN : Number(price.replace(',', '.')),
    effectiveFrom,
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!parsed.success) return;
    mutation.mutate(
      { data: parsed.data },
      {
        onSuccess: () => {
          toast.success(t('tariffs.addSuccess'));
          setPrice('');
          setEffectiveFrom('');
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError && error.status === 409
              ? t('tariffs.duplicate')
              : t('tariffs.addError'),
          ),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div
        role="group"
        aria-label={t('tariffs.kind')}
        className="flex gap-1 p-1 rounded-lg bg-muted"
      >
        {KINDS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={kind === option}
            onClick={() => setKind(option)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              kind === option ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {t(tariffKindKey(option))}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        {t('tariffs.price')}
        <input
          type="text"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0,2516"
          className="w-32 px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground tabular-nums"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        {t('tariffs.effectiveFrom')}
        <input
          type="date"
          value={effectiveFrom}
          onChange={(e) => setEffectiveFrom(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
        />
      </label>
      <button
        type="submit"
        disabled={mutation.isPending || !parsed.success}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 rounded-lg border border-border bg-card"
      >
        {mutation.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        {t('tariffs.add')}
      </button>
    </form>
  );
};
