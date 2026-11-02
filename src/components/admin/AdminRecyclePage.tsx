import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  subscribeToRecycleStock,
  subscribeToRecycleHandovers,
  setRecycleProgramActive,
  updateRecycleCapacity,
  recordRecycleHandover,
} from '../../services/firebaseRealtimeService';
import type { RecycleHandover } from '../../services/firebaseRealtimeService';
import { Leaf, AlertCircle, CheckCircle2, PackageCheck } from 'lucide-react';

export const AdminRecyclePage: React.FC = () => {
  const { recycleSettings, impactStats, orders, artisans, hasPermission, currentStaffUser, adminUsername } =
    useApp();
  const canManage = hasPermission('orders_status_update');

  const [stock, setStock] = useState({ currentKg: 0, capacityKg: 0 });
  const [handovers, setHandovers] = useState<RecycleHandover[]>([]);
  const [capacityText, setCapacityText] = useState('');
  const [artisanName, setArtisanName] = useState('');
  const [kgText, setKgText] = useState('');
  const [dateText, setDateText] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const u1 = subscribeToRecycleStock(setStock);
    const u2 = subscribeToRecycleHandovers(setHandovers);
    return () => {
      u1();
      u2();
    };
  }, []);

  useEffect(() => {
    setCapacityText(stock.capacityKg ? String(stock.capacityKg) : '');
  }, [stock.capacityKg]);

  const programOn = recycleSettings.programActive;
  const isFull = stock.capacityKg > 0 && stock.currentKg >= stock.capacityKg;
  const percent =
    stock.capacityKg > 0 ? Math.min(100, Math.round((stock.currentKg / stock.capacityKg) * 100)) : 0;
  const stats: any = impactStats || {};

  const waitingDropoff = orders.filter(
    (o) =>
      o.recycle?.enabled &&
      o.recycle.status === 'pending_verification' &&
      o.handoverMethod === 'store_dropoff'
  ).length;
  const waitingCourier = orders.filter(
    (o) =>
      o.recycle?.enabled &&
      o.recycle.status === 'pending_verification' &&
      o.handoverMethod !== 'store_dropoff'
  ).length;

  const handleToggle = async () => {
    if (!canManage) return;
    if (!programOn && isFull) {
      setMsg({
        ok: false,
        text: 'Stok masih penuh. Catat penyerahan ke pengrajin dulu, baru program bisa diaktifkan.',
      });
      return;
    }
    await setRecycleProgramActive(!programOn);
    setMsg({ ok: true, text: !programOn ? 'Program diaktifkan.' : 'Program dinonaktifkan.' });
  };

  const handleSaveCapacity = async () => {
    const n = parseFloat(capacityText.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) {
      setMsg({ ok: false, text: 'Isi kapasitas lebih dari 0 kg.' });
      return;
    }
    await updateRecycleCapacity(n);
    setMsg({ ok: true, text: 'Kapasitas disimpan.' });
  };

  const handleHandover = async () => {
    const kg = parseFloat(kgText.replace(',', '.'));
    if (!artisanName.trim()) {
      setMsg({ ok: false, text: 'Isi nama pengrajin penerima.' });
      return;
    }
    if (!Number.isFinite(kg) || kg <= 0) {
      setMsg({ ok: false, text: 'Isi berat yang diserahkan (kg).' });
      return;
    }
    setBusy(true);
    const res = await recordRecycleHandover({
      artisanName: artisanName.trim(),
      kg,
      date: dateText,
      note: note.trim(),
      photoUrl: photoUrl.trim(),
      createdBy: currentStaffUser?.name || adminUsername,
    });
    setBusy(false);
    setMsg({ ok: res.ok, text: res.message });
    if (res.ok) {
      setKgText('');
      setNote('');
      setPhotoUrl('');
    }
  };

  return (
    <div id="admin-recycle-page" className="space-y-5">
      <div className="flex items-center gap-2">
        <Leaf className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-[#254117]">Daur Ulang (Laundrea Peduli)</h1>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            msg.ok
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Stok di gerai', value: `${stock.currentKg} kg` },
          { label: 'Total terkumpul', value: `${stats.totalKg ?? 0} kg` },
          { label: 'Pelanggan ikut', value: stats.participants ?? 0 },
          { label: 'Kali diserahkan', value: stats.handovers ?? 0 },
        ].map((c) => (
          <div key={c.label} className="bg-white p-4 rounded-2xl border border-gray-200 text-center">
            <span className="text-[10px] font-bold uppercase text-[#254117]/60 block">{c.label}</span>
            <span className="text-xl font-black text-[#254117]">{c.value}</span>
          </div>
        ))}
      </div>

      {/* Stok + program */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 space-y-3">
          <h2 className="text-sm font-bold text-[#254117]">Stok & Kapasitas</h2>
          <div className="w-full h-3 rounded-full bg-emerald-50 border border-emerald-200 overflow-hidden">
            <div
              className={`h-full transition-all ${isFull ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-[#254117]/80">
            {stock.currentKg} kg dari {stock.capacityKg || '—'} kg ({percent}%)
          </p>
          {isFull && (
            <p className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl p-2">
              Stok penuh. Setor ke pengrajin dulu, program tidak bisa diaktifkan sebelum itu.
            </p>
          )}
          {!isFull && percent >= 80 && (
            <p className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2">
              Stok hampir penuh. Jadwalkan penyerahan ke pengrajin.
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={capacityText}
              onChange={(e) => {
                if (/^\d*[.,]?\d*$/.test(e.target.value)) setCapacityText(e.target.value);
              }}
              placeholder="Kapasitas (kg)"
              disabled={!canManage}
              className="w-32 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold"
            />
            <button
              type="button"
              onClick={handleSaveCapacity}
              disabled={!canManage}
              className="px-3 py-2 rounded-xl bg-[#254117] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              Simpan Kapasitas
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 space-y-3">
          <h2 className="text-sm font-bold text-[#254117]">Program di Web Pelanggan</h2>
          <div className="flex items-center justify-between gap-3">
            <div>
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  programOn ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {programOn ? 'AKTIF' : 'NONAKTIF'}
              </span>
              <p className="text-[11px] text-[#254117]/70 mt-1.5">
                Saat nonaktif, pelanggan melihat "Program daur ulang sedang penuh". Program mati otomatis saat stok penuh.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              disabled={!canManage || (!programOn && isFull)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                programOn ? 'bg-red-100 text-red-700' : 'bg-emerald-600 text-white'
              }`}
            >
              {programOn ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
          <div className="text-[11px] text-[#254117]/70 space-y-0.5 pt-2 border-t border-gray-100">
            <p>Menunggu ditimbang kurir: <strong>{waitingCourier}</strong> pesanan</p>
            <p>Antar sendiri, perlu verifikasi admin: <strong>{waitingDropoff}</strong> pesanan</p>
          </div>
        </div>
      </div>

      {/* Setor ke pengrajin */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 space-y-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-[#254117]">Catat Penyerahan ke Pengrajin</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              list="recycle-artisans"
              value={artisanName}
              onChange={(e) => setArtisanName(e.target.value)}
              placeholder="Nama pengrajin penerima"
              disabled={!canManage}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
            />
            <datalist id="recycle-artisans">
              {(artisans as any[]).map((a) => (
                <option key={a.id} value={a.name} />
              ))}
            </datalist>
          </div>
          <input
            type="date"
            value={dateText}
            onChange={(e) => setDateText(e.target.value)}
            disabled={!canManage}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={kgText}
              onChange={(e) => {
                if (/^\d*[.,]?\d*$/.test(e.target.value)) setKgText(e.target.value);
              }}
              placeholder="Berat (kg)"
              disabled={!canManage}
              className="w-28 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold"
            />
            <button
              type="button"
              onClick={() => setKgText(String(stock.currentKg))}
              disabled={!canManage || stock.currentKg <= 0}
              className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              Setor semua ({stock.currentKg} kg)
            </button>
          </div>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Link foto serah terima (opsional)"
            disabled={!canManage}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan (opsional)"
            disabled={!canManage}
            className="w-full sm:col-span-2 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
          />
        </div>
        <button
          type="button"
          onClick={handleHandover}
          disabled={!canManage || busy || stock.currentKg <= 0}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Menyimpan...' : 'Catat Penyerahan'}
        </button>
        {stock.currentKg <= 0 && (
          <p className="text-[11px] text-[#254117]/60">Belum ada stok yang bisa diserahkan.</p>
        )}
      </div>

      {/* Riwayat */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 space-y-2">
        <h2 className="text-sm font-bold text-[#254117]">Riwayat Penyerahan ({handovers.length})</h2>
        {handovers.length === 0 ? (
          <p className="text-xs text-[#254117]/60">Belum ada penyerahan.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {handovers.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-[#254117]">{h.artisanName}</p>
                  <p className="text-[11px] text-[#254117]/60">
                    {h.date}
                    {h.note ? ` • ${h.note}` : ''}
                    {h.createdBy ? ` • oleh ${h.createdBy}` : ''}
                  </p>
                  {h.photoUrl && (
                    <a
                      href={h.photoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 font-semibold hover:underline"
                    >
                      Lihat foto
                    </a>
                  )}
                </div>
                <span className="font-black text-emerald-800 shrink-0">{h.kg} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
