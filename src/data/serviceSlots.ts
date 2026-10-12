export interface ServiceSlot {
  label: string;
  courierKey: 'dimas' | 'budi'; // dicocokkan ke nama kurir
  shift: string;
}

export const SERVICE_SLOTS: ServiceSlot[] = [
  { label: '07:00 - 10:00', courierKey: 'dimas', shift: 'Shift Pagi' },
  { label: '10:00 - 13:00', courierKey: 'dimas', shift: 'Shift Pagi' },
  { label: '14:00 - 17:00', courierKey: 'budi', shift: 'Shift Sore' },
  { label: '17:00 - 20:00', courierKey: 'budi', shift: 'Shift Sore' },
];
