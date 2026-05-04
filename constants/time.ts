export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({
  label: name,
  value: index + 1,
}));
