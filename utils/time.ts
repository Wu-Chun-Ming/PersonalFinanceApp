import { MONTH_NAMES } from '@/constants/time';

const getMonthName = (monthNumber: number) => MONTH_NAMES[monthNumber - 1];

export { getMonthName };
