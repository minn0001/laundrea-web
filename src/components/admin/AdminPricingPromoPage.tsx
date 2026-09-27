import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plan, PlanType } from '../../types';
import { Tag, Edit2, Check, Plus, Percent, Sparkles, CheckCircle2 } from 'lucide-react';

export const AdminPricingPromoPage: React.FC = () => {
  const { plans, updatePlan, promos, addPromo, togglePromo } = useApp();

  const [editingPlanId, setEditingPlanId] = useState<PlanType | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editTurnaround, setEditTurnaround] = useState<string>('');
  const [editFeatures, setEditFeatures] = useState<string>('');
  const [saveToast, setSaveToast] = useState(false);

  // New promo state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newDiscount, setNewDiscount] = useState<number>(10);
  const [newMinOrder, setNewMinOrder] = useState<number>(50000);

  const startEditing = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setEditPrice(plan.price);
    setEditTurnaround(plan.turnaroundTime);
    setEditFeatures(plan.features.join('\n'));
  };

  const savePlanEdit = (plan: Plan) => {
    const updatedFeatures = editFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    updatePlan({
      ...plan,
      price: editPrice,
      turnaroundTime: editTurnaround,
      features: updatedFeatures,
    });

    setEditingPlanId(null);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    addPromo(newPromoCode, newDiscount, newMinOrder);
    setNewPromoCode('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#254117]">Harga Layanan & Promosi</h1>
      </div>

      {saveToast && (
        <div className="p-3 bg-[#97a273] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>Perubahan paket berhasil disimpan dan langsung tersinkronisasi ke portal pelanggan!</span>
        </div>
      )}

      {/* 1. Editable Plans Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#254117] flex items-center gap-2">
          <span>Kelola 3 Paket Layanan</span>
          <span className="text-xs font-normal text-[#254117]/60">
            (Klik &ldquo;Ubah Tarif&rdquo; untuk mengedit)
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isEditing = editingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className="bg-white p-5 rounded-3xl border-2 border-gray-200 hover:border-[#cd6184]/40 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#254117]">{plan.name}</h3>
                      {plan.isPopular && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#ffbd59] text-[#254117] text-[10px] font-extrabold uppercase">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-[#ffecf2] text-[#cd6184] rounded-lg">
                      /{plan.unit}
                    </span>
                  </div>

                  {isEditing ? (
                    /* Edit Mode Form */
                    <div className="mt-4 space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-[#254117] mb-1">
                          Tarif (Rp):
                        </label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-xl font-bold text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#254117] mb-1">
                          Waktu Pengerjaan:
                        </label>
                        <input
                          type="text"
                          value={editTurnaround}
                          onChange={(e) => setEditTurnaround(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#254117] mb-1">
                          Fitur (1 baris per poin):
                        </label>
                        <textarea
                          rows={4}
                          value={editFeatures}
                          onChange={(e) => setEditFeatures(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-xl text-[11px]"
                        />
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="mt-3 space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#254117]">
                          Rp {plan.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-[#254117]/60">/{plan.unit}</span>
                      </div>

                      <p className="text-xs font-semibold text-[#97a273]">{plan.turnaroundTime}</p>

                      <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-[#254117]/80">
                        {plan.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-[#97a273] font-bold">✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPlanId(null)}
                        className="w-1/2 py-2 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => savePlanEdit(plan)}
                        className="w-1/2 py-2 text-xs font-bold rounded-xl bg-[#cd6184] text-white shadow-xs"
                      >
                        Simpan
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(plan)}
                      className="w-full py-2 text-xs font-bold rounded-xl bg-gray-100 hover:bg-[#cd6184] hover:text-white text-[#254117] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Ubah Tarif & Poin</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Promotions & Promo Codes Section */}
      <div className="pt-4 border-t border-gray-200">
        <h2 className="text-lg font-bold text-[#254117] mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#cd6184]" />
          <span>Kode Promo & Diskon Pelanggan</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Promo Form */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#254117]">Buat Kode Promo Baru</h3>
            <form onSubmit={handleCreatePromo} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Kode Promo (Contoh: BERSIH20)
                </label>
                <input
                  type="text"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                  placeholder="KODE PROMO"
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-gray-200 uppercase focus:outline-none focus:border-[#cd6184]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#254117] mb-1">
                    Diskon (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#254117] mb-1">
                    Min. Order (Rp)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Terbitkan Kode Promo</span>
              </button>
            </form>
          </div>

          {/* Active Promo Codes List */}
          <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#254117]">Daftar Kode Promo Aktif</h3>

            <div className="space-y-2.5">
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    promo.isActive
                      ? 'bg-[#ffecf2]/50 border-[#cd6184]/30'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-white rounded-xl border border-[#cd6184]/30 font-mono font-bold text-xs text-[#cd6184]">
                      {promo.code}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-[#254117] block">
                        Potongan {promo.discountPercent}%
                      </span>
                      <span className="text-[11px] text-[#254117]/60">
                        Min. order Rp {(promo.minOrderValue || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePromo(promo.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      promo.isActive
                        ? 'bg-[#97a273] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {promo.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
