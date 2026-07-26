import React, { useState } from 'react';
import { History, Calendar, Printer, Eye, Search, Filter, Trash2, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, printReceipt } from '../utils/bluetoothPrinter';

interface SalesHistoryProps {
  transactions: Transaction[];
  onViewReceipt: (tx: Transaction) => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  transactions,
  onViewReceipt
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'hari' | 'minggu' | 'bulan' | 'tahun'>('hari');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const now = new Date();

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.timestamp);
    let periodMatch = true;

    if (filterPeriod === 'hari') {
      periodMatch = txDate.toDateString() === now.toDateString();
    } else if (filterPeriod === 'minggu') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodMatch = txDate >= sevenDaysAgo;
    } else if (filterPeriod === 'bulan') {
      periodMatch = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    } else if (filterPeriod === 'tahun') {
      periodMatch = txDate.getFullYear() === now.getFullYear();
    }

    const searchMatch = tx.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tx.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tx.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    return periodMatch && searchMatch;
  });

  const totalFilteredRevenue = filteredTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalFilteredProfit = filteredTransactions.reduce((sum, tx) => sum + tx.profit, 0);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-gray-900">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 flex items-center gap-3">
            <History className="w-8 h-8 text-blue-600" />
            <span>RIWAYAT PENJUALAN</span>
          </h1>
          <p className="text-sm text-gray-600 font-bold mt-1">
            Daftar seluruh transaksi kasir yang telah diselesaikan
          </p>
        </div>

        {/* Total Omset & Profit Stats */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-gray-50 px-5 py-3 rounded-2xl border-2 border-gray-200 text-center">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
              TOTAL OMSET (FILTER):
            </span>
            <div className="text-2xl sm:text-3xl font-black text-green-600 font-mono">
              {formatRupiah(totalFilteredRevenue)}
            </div>
          </div>

          <div className="bg-gray-50 px-5 py-3 rounded-2xl border-2 border-gray-200 text-center">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">
              ESTIMASI KEUNTUNGAN:
            </span>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
              {formatRupiah(totalFilteredProfit)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border-2 border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Period Tabs */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 gap-1">
            {(['hari', 'minggu', 'bulan', 'tahun'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors cursor-pointer ${
                  filterPeriod === period
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'hari' && 'Hari Ini'}
                {period === 'minggu' && 'Minggu Ini'}
                {period === 'bulan' && 'Bulan Ini'}
                {period === 'tahun' && 'Tahun Ini'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari no invoice, nama barang, kasir..."
              className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-2xl py-2.5 px-4 pl-10 text-gray-900 font-bold"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white py-16 text-center text-gray-400 rounded-3xl border-2 border-gray-200 space-y-2">
            <History className="w-16 h-16 mx-auto text-gray-300" />
            <p className="text-2xl font-black text-gray-500">Belum Ada Transaksi Penjualan</p>
            <p className="text-sm text-gray-400">Transaksi yang diselesaikan di Kasir akan muncul di sini.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white border-2 border-gray-200 hover:border-blue-400 p-4 sm:p-5 rounded-3xl shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Info Left */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-blue-600 font-mono">{tx.invoiceNumber}</span>
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold uppercase border border-gray-300">
                    {tx.paymentMethod}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(tx.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                {/* Items Summary string */}
                <p className="text-sm text-gray-800 font-bold max-w-xl">
                  {tx.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                </p>
              </div>

              {/* Amount Right & Actions */}
              <div className="flex items-center justify-between w-full md:w-auto gap-4">
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-green-600 font-mono">
                    {formatRupiah(tx.totalAmount)}
                  </div>
                  <div className="text-xs text-gray-500 font-bold">
                    Bayar: {formatRupiah(tx.paidAmount)} | Kembalian: {formatRupiah(tx.changeAmount)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewReceipt(tx)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl border border-gray-300 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                    title="Lihat Struk"
                  >
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="hidden sm:inline">Struk</span>
                  </button>

                  <button
                    onClick={() => printReceipt(tx)}
                    className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                    title="Cetak Ulang"
                  >
                    <Printer className="w-5 h-5" />
                    <span className="hidden sm:inline">Cetak</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
