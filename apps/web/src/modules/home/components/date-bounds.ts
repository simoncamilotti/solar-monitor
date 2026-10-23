/** The months a calendar may show and the days it disables, outside the history. */
export const calendarBounds = (min: Date | undefined, max: Date | undefined) => ({
  startMonth: min,
  endMonth: max,
  disabled: [...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])],
});

/** The month a calendar opens on: today's, kept within the history. */
export const initialMonth = (min: Date | undefined, max: Date | undefined): Date => {
  const today = new Date();
  if (max && today > max) return max;
  if (min && today < min) return min;
  return today;
};
