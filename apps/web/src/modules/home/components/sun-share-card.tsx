import { motion } from 'framer-motion';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { formatEnergy } from '../../shared/format/index.js';
import { getEnergyColors, useDisplayedTheme } from '../../shared/metrics/energy-colors.js';
import { computeSunShare, type EnergySplit } from '../../shared/metrics/energy-split.js';

type ShareBarProps = {
  title: string;
  total: number;
  share: number;
  shareLabel: string;
  restLabel: string;
  shareColor: string;
  restColor: string;
};

const ShareBar: FunctionComponent<ShareBarProps> = ({
  title,
  total,
  share,
  shareLabel,
  restLabel,
  shareColor,
  restColor,
}) => {
  const { i18n } = useTranslation();
  const rounded = Math.round(share);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-sm text-muted-foreground data-text">
          {formatEnergy(total, i18n.language)}
        </span>
      </div>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        <div style={{ width: `${share}%`, backgroundColor: shareColor }} />
        <div className="flex-1" style={{ backgroundColor: restColor }} />
      </div>
      <div className="flex justify-between gap-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-semibold data-text">{rounded} %</span>
          <span className="text-muted-foreground">{shareLabel}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xl font-semibold data-text">{100 - rounded} %</span>
          <span className="text-muted-foreground">{restLabel}</span>
        </div>
      </div>
    </div>
  );
};

/** Where the sun went: share of the production used on site, of the consumption it covered. */
export const SunShareCard: FunctionComponent<{ split: EnergySplit }> = ({ split }) => {
  const { t } = useTranslation();
  const colors = getEnergyColors(useDisplayedTheme());
  const { productionUsedOnSite, consumptionFromSun } = computeSunShare(split);

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card-elevated p-6 flex flex-col gap-6 lg:w-80 shrink-0"
      aria-labelledby="sun-share-title"
    >
      <h3 id="sun-share-title" className="text-sm font-semibold">
        {t('home.sunShare.title')}
      </h3>
      {productionUsedOnSite === null && consumptionFromSun === null ? (
        <p className="text-sm text-muted-foreground">{t('home.sunShare.empty')}</p>
      ) : (
        <>
          {productionUsedOnSite !== null && (
            <ShareBar
              title={t('home.sunShare.production')}
              total={split.produced}
              share={productionUsedOnSite}
              shareLabel={t('home.sunShare.usedOnSite')}
              restLabel={t('home.sunShare.exported')}
              shareColor={colors.production}
              restColor={colors.export}
            />
          )}
          {consumptionFromSun !== null && (
            <ShareBar
              title={t('home.sunShare.consumption')}
              total={split.consumed}
              share={consumptionFromSun}
              shareLabel={t('home.sunShare.fromSun')}
              restLabel={t('home.sunShare.imported')}
              shareColor={colors.production}
              restColor={colors.import}
            />
          )}
        </>
      )}
    </motion.section>
  );
};
