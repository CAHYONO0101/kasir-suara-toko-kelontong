import React, { useState } from 'react';
import { Printer, CheckCircle2, Share2, X, Bluetooth, Loader2 } from 'lucide-react';
import { Transaction } from '../types';
import { printReceipt, printViaBluetooth, formatRupiah } from '../utils/bluetoothPrinter';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const [isBluetoothPrinting, setIsBluetoothPrinting] = useState<boolean>(false);

  if (!isOpen || !transaction) return null;

  const dateFormatted = new Date(transaction.timestamp).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const handlePrint = () => {
    printReceipt(transaction);
  };

  const handleBluetoothPrint = async () => {
    setIsBluetoothPrinting(true);
    const result = await printViaBluetooth(transaction);
    setIsBluetoothPrinting(false);
    if (!result.success) {
      alert(result.message);
      // Fallback to standard print window
      printReceipt(transaction);
    } else {
      alert(result.message);
    }
  };

  const handleShareWA = () => {
    const text = `*${transaction.tokoName}*\nNo: ${transaction.invoiceNumber}\nTgl: ${dateFormatted}\n\n` +
      transaction.items.map(i => `- ${i.productName} (${i.quantity} ${i.unit}) = ${formatRupiah(i.subtotal)}`).join('\n') +
      `\n\n*TOTAL: ${formatRupiah(transaction.totalAmount)}*\nBayar: ${formatRupiah(transaction.paidAmount)}\nKembalian: ${formatRupiah(transaction.changeAmount)}\n\nTerima kasih!`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white border-2 border-gray-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-gray-900 my-auto">
        
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-black uppercase tracking-wider">
              TRANSAKSI BERHASIL!
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-green-700 hover:bg-green-800 text-white flex items-center justify-center font-bold text-xl cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Thermal Receipt Visualizer Box */}
          <div className="bg-white text-gray-900 p-6 rounded-2xl font-mono text-sm shadow-md border-2 border-gray-300 space-y-3 leading-snug">
            
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-3">
              <div className="text-xl font-black uppercase tracking-wide">
                {transaction.tokoName || 'TOKO BERKAH JAYA'}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">No: {transaction.invoiceNumber}</div>
              <div className="text-xs text-gray-600">{dateFormatted}</div>
              <div className="text-xs text-gray-600">Kasir: {transaction.cashierName}</div>
            </div>

            {/* Items Table */}
            <div className="space-y-2 border-b-2 border-dashed border-gray-300 pb-3">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-gray-900">{item.productName}</div>
                  <div className="flex justify-between text-xs text-gray-700">
                    <span>{item.quantity} {item.unit} x {formatRupiah(item.sellPrice)}</span>
                    <span className="font-bold">{formatRupiah(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-base font-bold">
              <div className="flex justify-between text-xs text-gray-600">
                <span>METODE:</span>
                <span className="uppercase">{transaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-lg font-black border-t-2 border-gray-900 pt-1 text-gray-900">
                <span>TOTAL:</span>
                <span>{formatRupiah(transaction.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>BAYAR:</span>
                <span>{formatRupiah(transaction.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-green-700">
                <span>KEMBALIAN:</span>
                <span>{formatRupiah(transaction.changeAmount)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t-2 border-dashed border-gray-300 pt-3 text-xs space-y-1">
              <div className="font-bold">MATUR NUWUN / TERIMA KASIH</div>
              <div className="text-[10px] text-gray-500">Semoga Berkah & Laris Manis</div>
            </div>

          </div>

          {/* Action Buttons (Giant 80dp touch targets for elderly cashiers) */}
          <div className="space-y-3">
            <button
              onClick={handlePrint}
              className="w-full min-h-[80px] py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl rounded-2xl shadow-md border-2 border-blue-700 transition-colors flex items-center justify-center gap-3 cursor-pointer active:scale-95"
            >
              <Printer className="w-8 h-8" />
              <span>CETAK STRUK (PRINTER)</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={isBluetoothPrinting}
                onClick={handleBluetoothPrint}
                className="min-h-[70px] py-3 px-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-extrabold text-base rounded-2xl border-2 border-gray-300 flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isBluetoothPrinting ? (
                  <>
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin shrink-0" />
                    <span>Mencari...</span>
                  </>
                ) : (
                  <>
                    <Bluetooth className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Printer Bluetooth</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShareWA}
                className="min-h-[70px] py-3 px-3 bg-green-50 hover:bg-green-100 text-green-900 font-extrabold text-base rounded-2xl border-2 border-green-400 flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
              >
                <Share2 className="w-6 h-6 text-green-600 shrink-0" />
                <span>Kirim WA</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full min-h-[80px] py-4 bg-gray-900 hover:bg-gray-800 text-white font-black text-xl rounded-2xl border-2 border-gray-900 transition-colors cursor-pointer mt-2 active:scale-95"
            >
              TRANSAKSI BARU (+ BARANG LAIN)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
