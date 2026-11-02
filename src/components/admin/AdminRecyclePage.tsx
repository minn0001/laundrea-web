import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  subscribeToRecycleStock,
  subscribeToRecycleHandovers,
  setRecycleProgramActive,
  recordRecycleHandover,
  updateRecycleTarget,
} from '../../services/firebaseRealtimeService';
import type { RecycleHandover } from '../../services/firebaseRealtimeService';
import {
  Leaf,
  AlertCircle,
  CheckCircle2,
  PackageCheck,
  Calendar,
  User,
  Scale,
  FileText,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  X,
  Plus,
} from 'lucide-react';

export const AdminRecyclePage: React.FC = () => {
  const {
    recycleSettings,
    impactStats,
    orders,
    artisans,
    hasPermission,
    currentStaffUser,
    adminUsername,
  } = useApp();

  const canManage = hasPermission('orders_status_update');

  const [stock, setStock] = useState({ currentKg: 0, targetKg: 0 });
  const [targetText, setTargetText] = useState('');
  const [handovers, setHandovers] = useState<RecycleHandover[]>([]);

  // Handover form states
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [artisanName, setArtisanName] = useState('');
  const [kgText, setKgText] = useState('');
  const [dateText, setDateText] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const u1 = subscribeToRecycleStock((s) => {
      setStock({ currentKg: s.currentKg, targetKg: s.targetKg });
    });
    const u2 = subscribeToRecycleHandovers(setHandovers);
    return () => {
      u1();
      u2();
    };
  }, []);

  useEffect(() => {
    setTargetText(stock.targetKg ? String(stock.targetKg) : '');
  }, [stock.targetKg]);

  const targetPercent =
    stock.targetKg > 0 ? Math.min(100, Math.round((stock.currentKg / stock.targetKg) * 100)) : 0;
  const readyToHandover = stock.targetKg > 0 && stock.currentKg >= stock.targetKg;
  const programOn = recycleSettings.programActive;

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

  const handleSaveTarget = async () => {
    if (!canManage) return;
    const n = parseFloat(targetText.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) {
      setMsg({ ok: false, text: 'Isi target setor lebih dari 0 kg.' });
      return;
    }
    await updateRecycleTarget(n);
    setMsg({ ok: true, text: 'Target setor berhasil disimpan.' });
  };

  const handleToggleProgram = async () => {
    if (!canManage) return;
    if (!programOn && readyToHandover) {
      setMsg({
        ok: false,
        text: 'Stok masih mencapai target. Catat penyerahan ke pengrajin dulu agar stok berkurang.',
      });
      return;
    }
    const nextState = !programOn;
    await setRecycleProgramActive(nextState);
    setMsg({ ok: true, text: nextState ? 'Program diaktifkan kembali.' : 'Program dihentikan sementara.' });
  };

  const handleOpenHandoverForm = () => {
    setKgText(String(stock.currentKg));
    setShowHandoverForm(true);
  };

  const handleCancelHandover = () => {
    setShowHandoverForm(false);
    setArtisanName('');
    setKgText('');
    setNote('');
    setPhotoUrl('');
  };

  const handleHandover = async () => {
    if (!canManage) return;
    const kg = parseFloat(kgText.replace(',', '.'));
    if (!artisanName.trim()) {
      setMsg({ ok: false, text: 'Isi nama pengrajin penerima.' });
      return;
    }
    if (!Number.isFinite(kg) || kg <= 0) {
      setMsg({ ok: false, text: 'Isi berat yang diserahkan lebih dari 0 kg.' });
      return;
    }
    if (kg > stock.currentKg + 1e-9) {
      setMsg({ ok: false, text: `Stok yang tercatat hanya ${stock.currentKg} kg.` });
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
      handleCancelHandover();
    }
  };

  return (
    <div id="admin-recycle-page" className="space-y-5 animate-in fade-in duration-150">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#254117]">Daur Ulang (Laundrea Peduli)</h1>
            <p className="text-xs text-[#254117]/60">
              Kelola stok pakaian terkumpul, target pengrajin, dan pencatatan serah terima
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 border ${
            msg.ok
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{msg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMsg(null)}
            className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#254117]/60 block">
            Stok di gerai (belum disetor)
          </span>
          <span className="text-2xl font-black text-[#254117] mt-1 block">
            {stock.currentKg} kg
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#254117]/60 block">
            Total terkumpul (sepanjang waktu)
          </span>
          <span className="text-2xl font-black text-[#254117] mt-1 block">
            {stats.totalKg ?? 0} kg
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#254117]/60 block">
            Pelanggan yang ikut
          </span>
          <span className="text-2xl font-black text-[#254117] mt-1 block">
            {stats.participants ?? 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#254117]/60 block">
            Sudah disetor (kali)
          </span>
          <span className="text-2xl font-black text-[#254117] mt-1 block">
            {stats.handovers ?? 0}x
          </span>
        </div>
      </div>

      {/* Milestone Target Card */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border-2 space-y-4 shadow-xs transition-all ${
          readyToHandover
            ? 'bg-emerald-50/60 border-emerald-400'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-[#254117]">Milestone Target Penyetoran</h2>
              {readyToHandover && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white tracking-wider">
                  Target Tercapai
                </span>
              )}
            </div>
            <p className="text-xs text-[#254117]/80">
              {stock.targetKg > 0
                ? readyToHandover
                  ? `${stock.currentKg} kg sudah mencapai target ${stock.targetKg} kg. Saatnya setor ke pengrajin.`
                  : `${stock.currentKg} kg dari target ${stock.targetKg} kg (kurang ${Math.max(
                      0,
                      Math.round((stock.targetKg - stock.currentKg) * 100) / 100
                    )} kg)`
                : 'Isi target setor dulu, misalnya jumlah kilo yang biasanya diminta pengrajin.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!showHandoverForm && (
              <button
                type="button"
                id="btn-trigger-handover"
                onClick={handleOpenHandoverForm}
                disabled={!canManage || stock.currentKg <= 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${
                  readyToHandover
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                    : 'border-2 border-emerald-600 text-emerald-800 bg-white hover:bg-emerald-50'
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>{readyToHandover ? 'Setor ke Pengrajin' : 'Setor lebih awal'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3.5 rounded-full bg-gray-100 overflow-hidden p-0.5 border border-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                readyToHandover ? 'bg-emerald-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${targetPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#254117]/60 font-semibold px-0.5">
            <span>Stok saat ini: {stock.currentKg} kg</span>
            <span>Target: {stock.targetKg || 0} kg ({targetPercent}%)</span>
          </div>
        </div>

        {/* Target input row */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap">
          <label className="text-xs font-semibold text-[#254117] flex items-center gap-1.5">
            <span>Ubah Target Milestone:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={targetText}
              onChange={(e) => {
                if (/^\d*[.,]?\d*$/.test(e.target.value)) setTargetText(e.target.value);
              }}
              placeholder="Target setor (kg)"
              disabled={!canManage}
              className="w-32 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-[#254117] focus:outline-none focus:border-[#254117]"
            />
            <button
              type="button"
              id="btn-save-target"
              onClick={handleSaveTarget}
              disabled={!canManage}
              className="px-3 py-1.5 rounded-xl bg-[#254117] hover:bg-[#1e3412] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Simpan Target
            </button>
          </div>
        </div>

        {/* Inline Handover Form inside Milestone Card */}
        {showHandoverForm && (
          <div className="pt-4 border-t-2 border-emerald-200/80 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#254117] flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>Formulir Penyerahan Pakaian ke Pengrajin</span>
              </h3>
              <button
                type="button"
                onClick={handleCancelHandover}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Batal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#254117] block mb-1">
                  Nama Pengrajin Penerima:
                </label>
                <input
                  list="recycle-artisans"
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  placeholder="Pilih atau ketik nama pengrajin"
                  disabled={!canManage}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
                <datalist id="recycle-artisans">
                  {(artisans as any[]).map((a) => (
                    <option key={a.id} value={a.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#254117] block mb-1">
                  Tanggal Penyerahan:
                </label>
                <input
                  type="date"
                  value={dateText}
                  onChange={(e) => setDateText(e.target.value)}
                  disabled={!canManage}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#254117] block mb-1">
                  Berat yang Diserahkan (kg):
                </label>
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-[#254117] focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setKgText(String(stock.currentKg))}
                    disabled={!canManage || stock.currentKg <= 0}
                    className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    Semua ({stock.currentKg} kg)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#254117] block mb-1">
                  URL Foto Dokumentasi (opsional):
                </label>
                <input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={!canManage}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-[#254117] block mb-1">
                  Catatan / Keterangan Penyerahan (opsional):
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Cth: Penyerahan rutin tahap 1 untuk pembuatan tote bag dan keset"
                  disabled={!canManage}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                id="btn-save-handover"
                onClick={handleHandover}
                disabled={!canManage || busy || stock.currentKg <= 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Menyimpan...' : 'Simpan Setoran & Reset Stok'}
              </button>
              <button
                type="button"
                onClick={handleCancelHandover}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Program di Web Pelanggan */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#254117]">Status Program di Web Pelanggan</h2>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  programOn ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {programOn ? 'MENERIMA BAJU' : 'BERHENTI'}
              </span>
            </div>
            <p className="text-xs text-[#254117]/70 mt-1 max-w-xl">
              Saat berhenti, pelanggan melihat &ldquo;Program daur ulang sedang penuh, coba lagi nanti.&rdquo; Program otomatis berhenti saat stok mencapai target.
            </p>
          </div>

          <button
            type="button"
            id="btn-toggle-recycle-program"
            onClick={handleToggleProgram}
            disabled={!canManage || (!programOn && readyToHandover)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              programOn
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {programOn ? 'Hentikan Sementara' : 'Aktifkan Program'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs text-[#254117]/80">
          <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
            <span>Menunggu ditimbang kurir (jemputan):</span>
            <strong className="text-base text-[#254117]">{waitingCourier} pesanan</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
            <span>Antar sendiri ke gerai, perlu verifikasi:</span>
            <strong className="text-base text-[#254117]">{waitingDropoff} pesanan</strong>
          </div>
        </div>
      </div>

      {/* Riwayat Setoran */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#254117]">
            Riwayat Setoran ke Pengrajin ({handovers.length})
          </h2>
          <span className="text-[11px] text-[#254117]/60">Terbaru di atas</span>
        </div>

        {handovers.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-1">
            <PackageCheck className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-[#254117]">Belum Ada Riwayat Penyetoran</p>
            <p className="text-[11px] text-[#254117]/60">
              Penyetoran yang dicatat ke pengrajin akan tampil di sini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {handovers.map((h) => (
              <div key={h.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-[#254117]">{h.artisanName}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                      {h.date}
                    </span>
                  </div>
                  {h.note && (
                    <p className="text-[11px] text-[#254117]/75 italic">&ldquo;{h.note}&rdquo;</p>
                  )}
                  <p className="text-[10.5px] text-[#254117]/50">
                    {h.createdBy ? `Dicatat oleh ${h.createdBy}` : ''}
                  </p>
                  {h.photoUrl && (
                    <a
                      href={h.photoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold hover:underline mt-1"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Lihat Foto Serah Terima</span>
                    </a>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-black text-emerald-800 block">{h.kg} kg</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">Tersetor</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
