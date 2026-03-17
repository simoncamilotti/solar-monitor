/** Mapped system info for API responses */
export type EnphaseSystemDto = {
  id: number;
  name: string;
  timezone: string;
};

/** Response returned after a successful OAuth callback */
export type EnphaseCallbackResponseDto = {
  message: string;
  systems: EnphaseSystemDto[];
};

/** Response returned after a sync operation */
export type EnphaseSyncResponseDto = {
  message: string;
};

/** Response returned after a backfill operation */
export type EnphaseBackfillResponseDto = {
  message: string;
  daysBackfilled: number;
};
