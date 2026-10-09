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
      // Cap at 730 days to support long custom ranges
      while (cur <= end && dates.length < 730) {
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

export interface TrendChartBar {
  key: string;
  topLabel: string;
  bottomLabel: string;
  fullDateLabel: string;
  orders: number;
  revenue: number;
  minWidthClass: string;
  isDaily: boolean;
}

/**
 * Builds trend chart bars adapting intelligently to range length:
 * - Up to 14 days: one bar per day with two-line label (weekday on top, date like "08/09" below, no parens)
 * - 15 to 90 days: group bars by week and label like "01–07 Sep"
 * - More than 90 days: group by month and label like "Sep 26"
 */
export const getTrendChartBars = (dailyPoints: ChartDayPoint[]): TrendChartBar[] => {
  const totalDays = dailyPoints.length;
  if (totalDays === 0) return [];

  // Up to 14 days: one bar per day
  if (totalDays <= 14) {
    return dailyPoints.map((d) => {
      const parts = d.dateStr.split('-');
      const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dayName = INDO_DAYS[dObj.getDay()] || '';
      const dayFormatted = String(dObj.getDate()).padStart(2, '0');
      const monthFormatted = String(dObj.getMonth() + 1).padStart(2, '0');

      return {
        key: d.dateStr,
        topLabel: dayName,
        bottomLabel: `${dayFormatted}/${monthFormatted}`,
        fullDateLabel: d.fullDateLabel,
        orders: d.orders,
        revenue: d.revenue,
        minWidthClass: 'min-w-[38px] sm:min-w-[42px]',
        isDaily: true,
      };
    });
  }

  // 15 to 90 days: group bars by week
  if (totalDays <= 90) {
    const bars: TrendChartBar[] = [];
    for (let i = 0; i < dailyPoints.length; i += 7) {
      const chunk = dailyPoints.slice(i, i + 7);
      const startDay = chunk[0];
      const endDay = chunk[chunk.length - 1];

      const sParts = startDay.dateStr.split('-');
      const eParts = endDay.dateStr.split('-');
      const sDate = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, parseInt(sParts[2], 10));
      const eDate = new Date(parseInt(eParts[0], 10), parseInt(eParts[1], 10) - 1, parseInt(eParts[2], 10));

      const sDayNum = String(sDate.getDate()).padStart(2, '0');
      const eDayNum = String(eDate.getDate()).padStart(2, '0');
      const sMonth = INDO_MONTHS[sDate.getMonth()];
      const eMonth = INDO_MONTHS[eDate.getMonth()];

      let weekLabel: string;
      if (sDate.getMonth() === eDate.getMonth()) {
        weekLabel = `${sDayNum}–${eDayNum} ${sMonth}`;
      } else {
        weekLabel = `${sDayNum} ${sMonth}–${eDayNum} ${eMonth}`;
      }

      const weekOrders = chunk.reduce((sum, item) => sum + item.orders, 0);
      const weekRevenue = chunk.reduce((sum, item) => sum + item.revenue, 0);

      bars.push({
        key: `week-${startDay.dateStr}-${endDay.dateStr}`,
        topLabel: weekLabel,
        bottomLabel: `${weekOrders} pesanan`,
        fullDateLabel: `${weekLabel}: ${weekOrders} pesanan`,
        orders: weekOrders,
        revenue: weekRevenue,
        minWidthClass: 'min-w-[68px] sm:min-w-[76px]',
        isDaily: false,
      });
    }
    return bars;
  }

  // More than 90 days: group by month and label like "Sep 26"
  const monthMap = new Map<string, ChartDayPoint[]>();
  dailyPoints.forEach((d) => {
    const ym = d.dateStr.slice(0, 7);
    if (!monthMap.has(ym)) {
      monthMap.set(ym, []);
    }
    monthMap.get(ym)!.push(d);
  });

  const bars: TrendChartBar[] = [];
  monthMap.forEach((daysInMonth, ym) => {
    const [yStr, mStr] = ym.split('-');
    const mIndex = parseInt(mStr, 10) - 1;
    const monthName = INDO_MONTHS[mIndex] || ym;
    const yearTwoDigit = yStr.slice(-2);
    const monthLabel = `${monthName} ${yearTwoDigit}`;

    const mOrders = daysInMonth.reduce((sum, item) => sum + item.orders, 0);
    const mRevenue = daysInMonth.reduce((sum, item) => sum + item.revenue, 0);

    bars.push({
      key: `month-${ym}`,
      topLabel: monthLabel,
      bottomLabel: `${mOrders} pesanan`,
      fullDateLabel: `${monthName} ${yStr}: ${mOrders} pesanan`,
      orders: mOrders,
      revenue: mRevenue,
      minWidthClass: 'min-w-[56px] sm:min-w-[64px]',
      isDaily: false,
    });
  });

  return bars;
};
