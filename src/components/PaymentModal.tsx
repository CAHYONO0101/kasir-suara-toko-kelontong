import React, { useState } from 'react';
import { CreditCard, QrCode, Banknote, X, CheckCircle, Calculator, AlertTriangle, ArrowRight } from 'lucide-react';
import { CartItem, CashierSettings } from '../types';
import { formatRupiah } from '../utils/bluetoothPrinter';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalAmount: number;
  settings: CashierSettings;
  onCompletePayment: (
    paymentMethod: 'cash' | 'qris' | 'transfer',
    paidAmount: number,
    changeAmount: number
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cart,
  totalAmount,
  settings,
  onCompletePayment
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash');
  const [paidInput, setPaidInput] = useState<string>('');

  if (!isOpen) return null;

  const numericPaid = parseFloat(paidInput) || 0;
  const isPaidZeroOrMore = paymentMethod === 'cash' ? numericPaid >= totalAmount : true;
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, numericPaid - totalAmount) : 0;
  const deficitAmount = paymentMethod === 'cash' ? Math.max(0, totalAmount - numericPaid) : 0;

  // Preset cash shortcuts
  const QUICK_CASH_PRESETS = [
    { label: 'UANG PAS', val: totalAmount },
    { label: 'Rp 10.000', val: 10000 },
    { label: 'Rp 20.000', val: 20000 },
    { label: 'Rp 50.000', val: 50000 },
    { label: 'Rp 100.000', val: 100000 },
    { label: 'Rp 200.000', val: 200000 },
  ];

  const handleNumpadKey = (key: string) => {
    if (key === 'C') {
      setPaidInput('');
    } else if (key === 'DEL') {
      setPaidInput(prev => prev.slice(0, -1));
    } else if (key === '00') {
      if (paidInput) setPaidInput(prev => prev + '00');
    } else if (key === '000') {
      if (paidInput) setPaidInput(prev => prev + '000');
    } else {
      setPaidInput(prev => prev + key);
    }
  };

  const handleSubmit = () => {
    if (paymentMethod === 'cash' && numericPaid < totalAmount) {
      return;
    }

    const finalPaid = paymentMethod === 'cash' ? numericPaid : totalAmount;
    const finalChange = paymentMethod === 'cash' ? changeAmount : 0;

    onCompletePayment(paymentMethod, finalPaid, finalChange);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white border-2 border-gray-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl text-gray-900 my-auto">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-black">
              <Banknote className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                PEMBAYARAN KASIR
              </h2>
              <p className="text-xs font-bold text-blue-100">
                Total {cart.reduce((s, i) => s + i.quantity, 0)} Item Barang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center font-bold text-2xl cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          
          {/* TOTAL HARGA BANNER (GIANT TYPOGRAPHY) */}
          <div className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest block">
                TOTAL HARGA HARUS DIBAYAR:
              </span>
              <div className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-none font-mono">
                {formatRupiah(totalAmount)}
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-300 text-gray-800 text-sm font-bold shadow-xs">
              {cart.length} Jenis Barang
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-extrabold text-gray-600 uppercase tracking-wider block mb-2">
              PILIH METODE PEMBAYARAN:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`min-h-[80px] py-4 px-3 rounded-2xl border-2 font-black text-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Banknote className="w-8 h-8" />
                <span>TUNAI / CASH</span>
              </button>

              <button
                onClick={() => setPaymentMethod('qris')}
                className={`min-h-[80px] py-4 px-3 rounded-2xl border-2 font-black text-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'qris'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <QrCode className="w-8 h-8" />
                <span>QRIS</span>
              </button>

              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`min-h-[80px] py-4 px-3 rounded-2xl border-2 font-black text-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-8 h-8" />
                <span>TRANSFER</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Section */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              
              {/* Quick Cash Presets */}
              <div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                  Nominal Cepat (Pilih Uang Diterima):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_CASH_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPaidInput(preset.val.toString())}
                      className="py-3 px-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-600 rounded-xl font-black text-base sm:text-lg text-gray-900 transition-colors cursor-pointer active:scale-95"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Display & Giant Change Display Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Paid Input Box */}
                <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-300">
                  <label className="text-xs font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    UANG DITERIMA (NOMINAL):
                  </label>
                  <div className="text-3xl sm:text-4xl font-black text-gray-900 font-mono break-all min-h-[50px] flex items-center">
                    {paidInput ? formatRupiah(numericPaid) : <span className="text-gray-400">Rp 0</span>}
                  </div>
                </div>

                {/* KEMBALIAN (CHANGE) GIANT DISPLAY (60px+) */}
                <div className={`p-4 rounded-2xl border-2 flex flex-col justify-center ${
                  numericPaid >= totalAmount
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : paidInput
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  <span className="text-xs font-black uppercase tracking-widest block">
                    {numericPaid >= totalAmount ? 'KEMBALIAN PAS:' : 'UANG KURANG:'}
                  </span>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none font-mono mt-1">
                    {numericPaid >= totalAmount
                      ? formatRupiah(changeAmount)
                      : paidInput
                      ? formatRupiah(deficitAmount)
                      : 'Rp 0'}
                  </div>
                </div>

              </div>

              {/* On-Screen Touch Numpad */}
              <div className="bg-gray-100 p-3 rounded-2xl border-2 border-gray-200">
                <div className="grid grid-cols-4 gap-2">
                  {['7', '8', '9', 'C'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleNumpadKey(k)}
                      className={`py-3.5 rounded-xl font-black text-xl sm:text-2xl transition-all cursor-pointer active:scale-95 border ${
                        k === 'C' ? 'bg-red-600 hover:bg-red-500 text-white border-red-600' : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  {['4', '5', '6', 'DEL'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleNumpadKey(k)}
                      className={`py-3.5 rounded-xl font-black text-xl sm:text-2xl transition-all cursor-pointer active:scale-95 border ${
                        k === 'DEL' ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-600' : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  {['1', '2', '3', '00'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleNumpadKey(k)}
                      className="py-3.5 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-black text-xl sm:text-2xl border border-gray-300 transition-all cursor-pointer active:scale-95"
                    >
                      {k}
                    </button>
                  ))}
                  {['0', '000'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleNumpadKey(k)}
                      className="py-3.5 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-black text-xl sm:text-2xl border border-gray-300 transition-all cursor-pointer active:scale-95"
                    >
                      {k}
                    </button>
                  ))}
                  <button
                    onClick={() => setPaidInput(totalAmount.toString())}
                    className="col-span-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg transition-all cursor-pointer active:scale-95"
                  >
                    UANG PAS
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* QRIS Section */}
          {paymentMethod === 'qris' && (
            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-sm font-black text-blue-600 uppercase tracking-widest">
                SCAN QRIS UNTUK PEMBAYARAN:
              </span>
              
              {/* Simulated QR Code */}
              <div className="bg-white p-4 rounded-2xl border-2 border-gray-300 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=NMID-${settings.qrisNmr || '123456789'}-AMT-${totalAmount}`}
                  alt="QRIS Code"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="text-xl font-extrabold text-gray-900">
                NMID: <span className="text-blue-600 font-mono">{settings.qrisNmr || 'ID1029384756'}</span>
              </div>
              <p className="text-xs text-gray-500 max-w-sm">
                Minta pembeli scan menggunakan GoPay, OVO, ShopeePay, Dana, atau BCA Mobile.
              </p>
            </div>
          )}

          {/* Transfer Section */}
          {paymentMethod === 'transfer' && (
            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 space-y-3">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest block">
                REKENING TRANSFER BANK / E-WALLET:
              </span>
              <div className="bg-white p-4 rounded-xl border-2 border-gray-200 space-y-2">
                <div className="flex justify-between items-center text-lg font-extrabold">
                  <span className="text-gray-600">BANK BRI:</span>
                  <span className="font-mono text-blue-600">0123-01-098765-53-1</span>
                </div>
                <div className="flex justify-between items-center text-lg font-extrabold">
                  <span className="text-gray-600">A.N:</span>
                  <span className="text-gray-900">{settings.tokoName || 'WARUNG BERKAH'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Payment Button (Giant Touch Area 80dp) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onClose}
              className="min-h-[80px] flex-1 py-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xl rounded-2xl border-2 border-gray-300 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
            >
              BATAL
            </button>
            <button
              disabled={paymentMethod === 'cash' && numericPaid < totalAmount}
              onClick={handleSubmit}
              className={`min-h-[80px] flex-2 py-5 font-black text-2xl rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer active:scale-95 ${
                paymentMethod === 'cash' && numericPaid < totalAmount
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-300'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-700 shadow-blue-500/40'
              }`}
            >
              <CheckCircle className="w-9 h-9" />
              <span>SIMPAN & CETAK STRUK</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
