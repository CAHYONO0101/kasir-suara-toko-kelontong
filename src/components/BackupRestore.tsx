import React from 'react';
import { Database, Download, Upload, RefreshCw, CheckCircle, AlertTriangle, HardDrive } from 'lucide-react';
import { Product, Transaction, CashierSettings } from '../types';

interface BackupRestoreProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  settings: CashierSettings;
  onResetDefaultData: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  products,
  setProducts,
  transactions,
  setTransactions,
  settings,
  onResetDefaultData
}) => {

  // Export full JSON backup file
  const handleExportJsonBackup = () => {
    const backupData = {
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      tokoName: settings.tokoName,
      products,
      transactions
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Kasir_${settings.tokoName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore from JSON backup file
  const handleRestoreJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed && Array.isArray(parsed.products)) {
          if (confirm(`Pulihkan data toko dari file backup (${parsed.products.length} barang, ${parsed.transactions?.length || 0} riwayat transaksi)? Data saat ini akan ditimpa.`)) {
            setProducts(parsed.products);
            if (Array.isArray(parsed.transactions)) {
              setTransactions(parsed.transactions);
            }
            alert('Berhasil memulihkan data database kasir!');
          }
        } else {
          alert('Format file backup JSON tidak valid.');
        }
      } catch (err) {
        console.error('Restore error:', err);
        alert('Gagal membaca file backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6 text-gray-900">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm">
        <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          <span>BACKUP & PULIHKAN DATA DATABASE</span>
        </h1>
        <p className="text-sm text-gray-600 font-bold mt-1">
          Amankan data barang dan riwayat transaksi agar tidak hilang meskipun HP/tablet mati
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Backup Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center">
              <Download className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-gray-900">BACKUP DATABASE</h2>
              <p className="text-xs text-gray-500 font-bold">Unduh file cadangan data toko ke memori perangkat</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 font-bold">Total Barang:</span>
              <span className="font-bold text-gray-900">{products.length} item</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-bold">Total Transaksi:</span>
              <span className="font-bold text-gray-900">{transactions.length} riwayat</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-bold">Status Penyimpanan:</span>
              <span className="font-bold text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Tersimpan di LocalStorage
              </span>
            </div>
          </div>

          <button
            onClick={handleExportJsonBackup}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-2xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-6 h-6" />
            <span>UNDUH FILE BACKUP (.JSON)</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white font-black flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-gray-900">PULIHKAN (RESTORE)</h2>
              <p className="text-xs text-gray-500 font-bold">Kembalikan data dari file cadangan sebelumnya</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 font-medium">
            Pilih file cadangan (.json) dari memori perangkat untuk memulihkan seluruh barang dan riwayat penjualan.
          </p>

          <label className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-black text-xl rounded-2xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 text-center">
            <Upload className="w-6 h-6" />
            <span>PILIH FILE RESTORE</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreJsonBackup}
              className="hidden"
            />
          </label>
        </div>

      </div>

      {/* Reset Sample Data Option */}
      <div className="bg-white p-6 rounded-3xl border-2 border-red-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-xl font-black uppercase">RESET KE DATA CONTOH PASAR</h2>
        </div>
        <p className="text-sm text-gray-700 font-medium">
          Kembalikan database ke 35+ barang Sembako contoh standar pasar tradisional Indonesia (Minyak, Gula, Indomie, Aqua, Telur, Kopi).
        </p>
        <button
          onClick={onResetDefaultData}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-base rounded-2xl transition-colors cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Reset ke Sample Data Awal</span>
        </button>
      </div>

    </div>
  );
};
