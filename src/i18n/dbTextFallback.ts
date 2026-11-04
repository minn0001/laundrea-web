// Kamus cadangan untuk teks dari database yang belum punya versi English.
// Kunci = teks Indonesia PERSIS seperti di database. Kalau ada teks yang belum
// berubah, salin teks Indonesianya persis ke sini dan tambahkan terjemahannya.
const DB_TEXT_EN: Record<string, string> = {
  // Judul karya
  'Tote Bag Patchwork Perca': 'Patchwork Scrap Fabric Tote Bag',
  'Pouch Serut Multifungsi': 'Multipurpose Drawstring Pouch',
  'Sarung Bantal Patchwork Klasik': 'Classic Patchwork Pillow Cover',
  'Keset Geometris Perca Batik': 'Geometric Batik Scrap Fabric Doormat',

  // Deskripsi karya
  'Tas jinjing kokoh dari kain perca bermotif kotak. Praktis untuk belanja harian sekaligus mengurangi limbah tekstil.':
    'Sturdy tote bag made from checkered scrap fabric. Practical for daily shopping while reducing textile waste.',
  'Kantong serut unik dari sisa kain perca. Cocok untuk menyimpan kosmetik, aksesori, atau perlengkapan kecil lainnya.':
    'Unique drawstring pouch made from leftover scrap fabric. Great for storing cosmetics, accessories, or other small items.',
  'Sarung bantal estetik dari olahan kain perca. Memberikan sentuhan warna hangat dan daur ulang pada dekorasi ruangan.':
    'Aesthetic pillow cover made from upcycled scrap fabric. Adds a warm, recycled touch to your room decor.',
  'Keset/alas meja dengan pola melingkar rapi. Hasil kreasi jahit tingkat lanjut dari limbah kain perca aneka warna.':
    'Doormat/table mat with a neat circular pattern. An advanced sewing creation from colorful scrap fabric waste.',

  // Cerita pengrajin
  'Kelompok usaha warga Kelapa Gading yang memberdayakan ibu-ibu rumah tangga. Mereka mengolah kain perca sisa menjadi aneka tas jinjing (tote bag) dan kantung serut yang fungsional dan ramah lingkungan.':
    'A community business group in Kelapa Gading that empowers housewives. They turn leftover scrap fabric into functional, eco-friendly tote bags and drawstring pouches.',
  'Pengrajin perca berpengalaman sejak 2010 yang aktif mengajarkan teknik jahit patchwork. Karyanya fokus pada estetika geometris, seperti sarung bantal dan keset unik dari limbah kain.':
    'A scrap fabric artisan with experience since 2010 who actively teaches patchwork sewing techniques. Her work focuses on geometric aesthetics, such as pillow covers and unique doormats made from fabric waste.',
};

export const dbTextEn = (idText?: string): string | undefined =>
  idText ? DB_TEXT_EN[idText.trim()] : undefined;
