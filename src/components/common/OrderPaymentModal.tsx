import React, { useState, useEffect } from 'react';
import { Order, PaymentMethod } from '../../types';
import {
  CreditCard,
  QrCode,
  Banknote,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';

interface OrderPaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onChoosePayment: (orderId: string, method: PaymentMethod) => void;
  onAwaitingVerificationReached: (orderId: string) => void;
}

export const OrderPaymentModal: React.FC<OrderPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onChoosePayment,
  onAwaitingVerificationReached,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    order.paymentMethod || null
  );
  const [copiedVa, setCopiedVa] = useState(false);
  const [countdown, setCountdown] = useState<number>(10);

  // Sync state if order already has a payment method chosen
  useEffect(() => {
    if (order.paymentMethod) {
      setSelectedMethod(order.paymentMethod);
    }
  }, [order.paymentMethod]);

  // Derived price breakdown
  const actualQty = order.actualQuantity ?? order.estimatedQuantity;
  const rate = order.unitPrice;
  const gross = Math.round(actualQty * rate);
  const voucherDisc = order.voucherDiscount || 0;
  const finalTotal = Math.max(0, (order.actualPrice !== undefined ? order.actualPrice : gross) - voucherDisc);

  // Derive demo virtual account number from order number
  const cleanOrderDigits = order.orderNumber.replace(/\D/g, '') || '892308123456';
  const demoVaNumber = `8923 ${cleanOrderDigits.slice(-8).padStart(8, '0').match(/.{1,4}/g)?.join(' ')}`;

  // 10-second countdown simulation for Transfer and QRIS
  useEffect(() => {
    if (!isOpen) return;
    if (order.paymentStatus === 'awaiting_verification' || order.paymentStatus === 'paid') return;
    if (!order.paymentMethod || (order.paymentMethod !== 'bank_transfer' && order.paymentMethod !== 'qris')) return;

    // Check paymentChosenAt if available
    let remaining = 10;
    if (order.paymentChosenAt) {
      const elapsed = Math.floor((Date.now() - new Date(order.paymentChosenAt).getTime()) / 1000);
      remaining = Math.max(0, 10 - elapsed);
    }

    setCountdown(remaining);

    if (remaining === 0) {
      onAwaitingVerificationReached(order.id);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAwaitingVerificationReached(order.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, order.id, order.paymentMethod, order.paymentStatus, order.paymentChosenAt, onAwaitingVerificationReached]);

  if (!isOpen) return null;

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onChoosePayment(order.id, method);
  };

  const handleCopyVa = () => {
    navigator.clipboard?.writeText(demoVaNumber.replace(/\s+/g, ''));
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#cd6184] block">
              Pembayaran Pesanan
            </span>
            <h3 className="text-lg font-bold text-[#254117] mt-0.5">
              {order.orderNumber} ({order.planName})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price Breakdown */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
          <div className="font-bold text-[#254117] text-xs flex items-center justify-between">
            <span>Rincian Biaya Riil:</span>
            <span className="text-[11px] font-semibold text-[#cd6184]">
              {order.actualQuantity !== undefined ? 'Sudah Ditimbang Kurir' : 'Estimasi'}
            </span>
          </div>

          <div className="flex justify-between text-[#254117]/80">
            <span>
              Berat Riil: {actualQty} {order.unit} × Rp {rate.toLocaleString('id-ID')}
            </span>
            <span className="font-semibold">Rp {gross.toLocaleString('id-ID')}</span>
          </div>

          {voucherDisc > 0 && (
            <div className="flex justify-between text-[#cd6184] font-semibold">
              <span>Diskon Voucher ({order.voucherCode})</span>
              <span>-Rp {voucherDisc.toLocaleString('id-ID')}</span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-black text-sm text-[#254117]">
            <span>Total Tagihan:</span>
            <span className="text-lg text-[#254117]">
              Rp {finalTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Status: Menunggu Pembayaran & Method Selection */}
        {!selectedMethod ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Status: <strong>Menunggu Pembayaran</strong>. Pilih metode pembayaran Anda:</span>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: QRIS */}
              <button
                type="button"
                onClick={() => handleSelectMethod('qris')}
                className="w-full p-3.5 rounded-2xl border-2 border-gray-200 hover:border-[#cd6184] hover:bg-[#ffecf2]/30 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#254117] block">QRIS E-Wallet</span>
                    <span className="text-[11px] text-gray-500">GoPay, OVO, ShopeePay, BCA, Dana</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#cd6184] group-hover:translate-x-1 transition-transform">
                  Pilih →
                </span>
              </button>

              {/* Option 2: Bank Transfer */}
              <button
                type="button"
                onClick={() => handleSelectMethod('bank_transfer')}
                className="w-full p-3.5 rounded-2xl border-2 border-gray-200 hover:border-[#cd6184] hover:bg-[#ffecf2]/30 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#254117] block">Transfer Virtual Account</span>
                    <span className="text-[11px] text-gray-500">Laundrea Demo Bank VA</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#cd6184] group-hover:translate-x-1 transition-transform">
                  Pilih →
                </span>
              </button>

              {/* Option 3: COD */}
              <button
                type="button"
                onClick={() => handleSelectMethod('cod')}
                className="w-full p-3.5 rounded-2xl border-2 border-gray-200 hover:border-[#cd6184] hover:bg-[#ffecf2]/30 text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#254117] block">Bayar Tunai ke Kurir (COD)</span>
                    <span className="text-[11px] text-gray-500">Bayar tunai langsung kepada kurir saat penjemputan</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#cd6184] group-hover:translate-x-1 transition-transform">
                  Pilih →
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Method Selected View */
          <div className="space-y-4">
            {/* COD Specific Screen */}
            {selectedMethod === 'cod' && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Banknote className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-emerald-950">Bayar Tunai ke Kurir</h4>
                <p className="text-xs text-emerald-800 font-medium">
                  Serahkan uang tunai <strong>Rp {finalTotal.toLocaleString('id-ID')}</strong> kepada kurir sekarang.
                </p>
                <p className="text-[11px] text-emerald-700/80">
                  Kurir akan menekan tombol konfirmasi penerimaan tunai di aplikasinya setelah menerima pembayaran.
                </p>
              </div>
            )}

            {/* QRIS View */}
            {selectedMethod === 'qris' && (
              <div className="space-y-3">
                <div className="text-center space-y-2">
                  <span className="text-xs font-bold text-[#254117] block">Pindai QRIS Laundrea</span>
                  <div className="mx-auto max-w-[200px] bg-white p-2 rounded-2xl border border-gray-200 shadow-xs">
                    <img
                      src="/qris.png"
                      alt="QRIS Laundrea"
                      className="w-full h-auto object-contain rounded-xl"
                    />
                  </div>
                  <div className="text-xs font-black text-[#254117]">
                    Nominal: Rp {finalTotal.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Simulation countdown box (NO "konfirmasi sudah bayar" button) */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-900">
                    <Clock className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Simulasi: pembayaran terdeteksi otomatis dalam {countdown} detik</span>
                  </div>
                  <p className="text-[10px] text-blue-700">
                    Sistem mendeteksi transaksi secara real-time. Status akan otomatis berubah menjadi Menunggu Verifikasi Admin.
                  </p>
                </div>
              </div>
            )}

            {/* Bank Transfer View */}
            {selectedMethod === 'bank_transfer' && (
              <div className="space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#254117]">
                        Bank Permata Demo Virtual Account
                      </span>
                      <span className="text-[10px] bg-[#ffecf2] text-[#cd6184] px-2 py-0.5 rounded-md font-bold">
                        Demo
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Nomor Virtual Account:</span>
                        <span className="font-mono text-sm font-black text-[#254117] tracking-wider">
                          {demoVaNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyVa}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#254117] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedVa ? 'Disalin' : 'Salin'}</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-1 text-xs">
                      <span className="text-gray-600">Total Nominal Pembayaran:</span>
                      <span className="font-black text-[#254117] text-sm">
                        Rp {finalTotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulation countdown box (NO "konfirmasi sudah bayar" button) */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-900">
                    <Clock className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Simulasi: pembayaran terdeteksi otomatis dalam {countdown} detik</span>
                  </div>
                  <p className="text-[10px] text-blue-700">
                    Sistem mendeteksi mutasi rekening bank secara otomatis. Status akan langsung diperbarui.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
