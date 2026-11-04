import type { AppNotification } from '../types';

// Menerjemahkan notifikasi lama (yang belum punya titleEn/bodyEn) saat ditampilkan.
// Notifikasi baru sudah membawa titleEn/bodyEn dari AppContext, jadi dipakai apa adanya.

const TITLE_EN: Record<string, string> = {
  'Status Pesanan Diperbarui': 'Order Status Updated',
  'Pembayaran Menunggu': 'Payment Due',
  'Pembayaran Terverifikasi': 'Payment Verified',
  'Pembayaran Tunai Diterima': 'Cash Payment Received',
  'Stempel Bertambah 🎉': 'Stamp Earned 🎉',
  'Baju Daur Ulang Diterima': 'Recycled Clothes Received',
  'Baju Daur Ulang Tidak Memenuhi Syarat': 'Recycled Clothes Ineligible',
};

const STATUS_EN: Record<string, string> = {
  Penjemputan: 'Waiting for Pickup',
  'Dijemput Kurir': 'Picked Up by Courier',
  Pencucian: 'Washing',
  Pengeringan: 'Drying',
  Penyetrikaan: 'Ironing',
  'Siap Antar': 'Ready for Delivery',
  Selesai: 'Completed',
};

const RECYCLE_NOTE_EN: Record<string, string> = {
  'Stempel bonus ditambahkan 🌿': 'Bonus stamp added 🌿',
  'Beratnya di bawah 1 kg, jadi belum dapat stempel bonus.':
    'The weight is under 1 kg, so no bonus stamp yet.',
};

// Daftar pola: [regex teks Indonesia, fungsi pembuat teks English]
const BODY_PATTERNS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [
    /^Pesanan (\S+) sekarang: (.+)$/,
    (m) => `Order ${m[1]} is now: ${STATUS_EN[m[2]] || m[2]}`,
  ],
  [
    /^Pembayaran Menunggu — berat aktual (\S+) (\S+), total (Rp\S+)\. Silakan pilih metode pembayaran\.$/,
    (m) => `Payment Due — actual weight ${m[1]} ${m[2]}, total ${m[3]}. Please select a payment method.`,
  ],
  [
    /^Pembayaran Terverifikasi — Pesanan (\S+) masuk antrean pencucian\.$/,
    (m) => `Payment Verified — Order ${m[1]} is queued for washing.`,
  ],
  [
    /^Pembayaran Tunai Diterima — Pesanan (\S+)\.$/,
    (m) => `Cash Payment Received — Order ${m[1]}.`,
  ],
  [
    /^Selamat! Kamu berhasil mendapatkan 1 stempel dari pesanan (\S+)\.$/,
    (m) => `Congratulations! You earned 1 stamp from order ${m[1]}.`,
  ],
  [
    /^Terima kasih! Baju daur ulang (\S+) kg dari pesanan (\S+) sudah diterima\. (.+)$/,
    (m) =>
      `Thank you! ${m[1]} kg of recycled clothes from order ${m[2]} have been received. ${
        RECYCLE_NOTE_EN[m[3]] || m[3]
      }`,
  ],
  [
    /^Pesanan (\S+): (.+)\.$/,
    (m) => `Order ${m[1]}: ${m[2]}.`,
  ],
];

export const localizeNotification = (
  n: Pick<AppNotification, 'title' | 'body'> & { titleEn?: string; bodyEn?: string },
  lang: 'id' | 'en'
): { title: string; body: string } => {
  if (lang !== 'en') return { title: n.title, body: n.body };

  const title = n.titleEn || TITLE_EN[n.title?.trim()] || n.title;

  let body = n.bodyEn || '';
  if (!body) {
    const raw = (n.body || '').trim();
    for (const [re, build] of BODY_PATTERNS) {
      const m = raw.match(re);
      if (m) {
        body = build(m);
        break;
      }
    }
  }
  return { title, body: body || n.body };
};
