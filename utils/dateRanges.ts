export const getYearRange = (year?: number) => {
  return year
    ? {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31, 23, 59, 59, 999),
      }
    : null;
};

export const getMonthRange = (year?: number, month?: number) => {
  return year && month
    ? {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0, 23, 59, 59, 999),
      }
    : null;
};

export const getDateRange = (
  startDate?: Date | null,
  endDate?: Date | null,
) => {
  if (!startDate) return null;

  return {
    start: startDate,
    end: endDate ?? new Date(),
  };
};
