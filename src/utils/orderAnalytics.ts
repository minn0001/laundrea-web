import { Order } from '../types';

/**
 * Extracts order booking date in YYYY-MM-DD format.
 * Uses statusTimestamps.booked, falling back to pickupDate if missing.
 */
export const getOrderDate = (ord: Order): string => {
  if (ord.statusTimestamps?.booked) {
    const match = ord.statusTimestamps.booked.match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
    if (ord.statusTimestamps.booked.length >= 10) {
      return ord.statusTimestamps.booked.slice(0, 10);
    }
  }
  if (ord.pickupDate) {
    const match = ord.pickupDate.match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
    if (ord.pickupDate.length >= 10) {
      return ord.pickupDate.slice(0, 10);
    }
  }
  return '';
};

export const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getTodayDateStr = (): string => {
  return formatLocalDate(new Date());
};

export type PeriodFilter = 'today' | '7days' | 'month' | 'custom';

/**
 * Checks whether a given YYYY-MM-DD falls within the selected period filter.
 */
export const isDateInPeriod = (
  dateStr: string,
  filter: PeriodFilter,
  customStart?: string,
  customEnd?: string
): boolean => {
  if (!dateStr) return false;
  const cleanDate = dateStr.slice(0, 10);
  const today = getTodayDateStr();

  if (filter === 'today') {
    return cleanDate === today;
  }

  if (filter === '7days') {
    const now = new Date();
    const past7 = new Date(now);
    past7.setDate(past7.getDate() - 6);
    const past7Str = formatLocalDate(past7);
    return cleanDate >= past7Str && cleanDate <= today;
  }

  if (filter === 'month') {
    return cleanDate.slice(0, 7) === today.slice(0, 7);
  }

  if (filter === 'custom') {
    if (!customStart && !customEnd) return true;
    if (customStart && cleanDate < customStart) return false;
    if (customEnd && cleanDate > customEnd) return false;
    return true;
  }

  return true;
};

export interface ChartDayPoint {
  dateStr: string;
  dayLabel: string;
  fullDateLabel: string;
  orders: number;
  revenue: number;
  cost: number;
}

const INDO_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const INDO_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Generates an array of daily points for the given period filter.
 * Every day in the period is represented (days with 0 orders have orders: 0, revenue: 0).
 */
export const getPeriodDailyPoints = (
  filter: PeriodFilter,
  orders: Order[],
  operationalCosts: { date?: string; amount: number }[] = [],
  customStart?: string,
  customEnd?: string
): ChartDayPoint[] => {
  const dates: string[] = [];
  const today = new Date();

  if (filter === 'today') {
    dates.push(getTodayDateStr());
  } else if (filter === '7days') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(formatLocalDate(d));
    }
  } else if (filter === 'month') {
    const y = today.getFullYear();
    const m = today.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(y, m, day);
      dates.push(formatLocalDate(d));
    }
  } else if (filter === 'custom') {
    const start = customStart ? new Date(customStart) : new Date(today);
    const end = customEnd ? new Date(customEnd) : new Date(today);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
      const cur = new Date(start);
      // Cap at 62 days to keep visualization clean and performant
      while (cur <= end && dates.length < 62) {
        dates.push(formatLocalDate(cur));
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      dates.push(getTodayDateStr());
    }
  }

  return dates.map((dStr) => {
    const parts = dStr.split('-');
    const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayName = INDO_DAYS[dObj.getDay()] || '';
    const dayNum = parts[2];
    const monthName = INDO_MONTHS[dObj.getMonth()] || '';

    // Real orders placed on this date
    const dayOrders = orders.filter((o) => getOrderDate(o) === dStr);
    const dayRevenue = dayOrders.reduce(
      (sum, o) => sum + (o.actualPrice || o.estimatedPrice || 0),
      0
    );

    // Operational costs recorded on this date
    const dayCosts = operationalCosts.filter((c) => (c.date || '').slice(0, 10) === dStr);
    const dayCost = dayCosts.reduce((sum, c) => sum + (c.amount || 0), 0);

    let dayLabel = `${dayName} (${dayNum})`;
    if (filter === 'month') {
      dayLabel = dayNum; // e.g. "1", "2", ...
    } else if (filter === 'today') {
      dayLabel = `${dayName}, ${dayNum} ${monthName}`;
    }

    return {
      dateStr: dStr,
      dayLabel,
      fullDateLabel: `${dayName}, ${dayNum} ${monthName} ${parts[0]}`,
      orders: dayOrders.length,
      revenue: dayRevenue,
      cost: dayCost,
    };
  });
};
