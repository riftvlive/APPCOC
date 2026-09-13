const MOROCCO_TIME_ZONE = 'Africa/Casablanca';

export const getMoroccoDateISO = (date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MOROCCO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date).reduce<Record<string, string>>((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const addDaysToDateISO = (dateISO: string, days: number): string => {
  const [year, month, day] = dateISO.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().substring(0, 10);
};

/** First day of a cycle is day 1. Returns 0 for an invalid/pre-cycle date. */
export const getCycleDayNumber = (startDateISO: string, operationDateISO: string): number => {
  if (!startDateISO || !operationDateISO) return 0;
  const start = Date.parse(`${startDateISO}T12:00:00Z`);
  const operation = Date.parse(`${operationDateISO}T12:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(operation)) return 0;
  const difference = Math.floor((operation - start) / 86400000);
  return difference >= 0 ? difference + 1 : 0;
};
