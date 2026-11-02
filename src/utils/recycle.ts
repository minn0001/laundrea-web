import { Order } from '../types';

/**
 * Checks if an order earns a Laundrea Peduli recycling bonus stamp.
 * Every accepted recycling handover of at least 1 kg earns a stamp,
 * regardless of legacy stored bonusGranted flags.
 */
export const earnsRecycleStamp = (order?: Partial<Order> | { recycle?: Order['recycle'] } | null): boolean => {
  if (!order || !order.recycle) return false;
  if (order.recycle.status !== 'verified') return false;
  const kg = order.recycle.finalKg ?? order.recycle.actualKg ?? 0;
  return kg >= 1;
};
