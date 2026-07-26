import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  AlertTriangle, 
  X, 
  Check,
  Barcode
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product } from '../types';
import { formatRupiah } from '../utils/bluetoothPrinter';

interface InventoryManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  setProducts
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    barcode: string;
    name: string;
    category: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    unit: string;
    aliases: string;
  }>({
    barcode: '',
    name: '',
    category: 'Sembako',
    buyPrice: 0,
    sellPrice: 0,
    stock: 10,
    unit: 'pcs',
    aliases: ''
  });

  const categories = ['SEMUA', 'Sembako', 'Minuman', 'Bumbu & Dapur', 'Makanan Ringan', 'Sabun & Kebersihan', 'Gas & Rokok'];
  const units = ['pcs', 'kg', 'bungkus', 'botol', 'galon', 'liter', 'pouch', 'kaleng', 'renteng', 'sachet', 'kotak', 'karung', 'tabung'];

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'SEMUA' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.barcode.includes(searchTerm) ||
                        p.aliases?.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      barcode: `899${Math.floor(100000000 + Math.random() * 900000000)}`,
      name: '',
      category: 'Sembako',
      buyPrice: 1000,
      sellPrice: 1500,
      stock: 20,
      unit: 'pcs',
      aliases: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      barcode: prod.barcode,
      name: prod.name,
      category: prod.category,
      buyPrice: prod.buyPrice,
      sellPrice: prod.sellPrice,
      stock: prod.stock,
      unit: prod.unit,
      aliases: prod.aliases ? prod.aliases.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus barang "${name}" dari database toko?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama barang tidak boleh kosong!');
      return;
    }

    const aliasesArray = formData.aliases
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    if (editingProduct) {
      setProducts(prev => prev.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            barcode: formData.barcode,
            name: formData.name,
            category: formData.category,
            buyPrice: formData.buyPrice,
            sellPrice: formData.sellPrice,
            stock: formData.stock,
            unit: formData.unit,
            aliases: aliasesArray
          };
        }
        return p;
      }));
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        barcode: formData.barcode,
        name: formData.name,
        category: formData.category,
        buyPrice: formData.buyPrice,
        sellPrice: formData.sellPrice,
        stock: formData.stock,
        unit: formData.unit,
        aliases: aliasesArray
      };
      setProducts(prev => [newProd, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Export Excel (.xlsx)
  const handleExportExcel = () => {
    const dataToExport = products.map((p, index) => ({
      No: index + 1,
      'Barcode': p.barcode,
      'Nama Barang': p.name,
      'Kategori': p.category,
      'Harga Beli (Rp)': p.buyPrice,
      'Harga Jual (Rp)': p.sellPrice,
      'Stok': p.stock,
      'Satuan': p.unit,
      'Panggilan Suara / Alias': p.aliases ? p.aliases.join(', ') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Database Barang');

    XLSX.writeFile(workbook, `Database_Barang_Toko_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Import Excel (.xlsx)
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (data && data.length > 0) {
          const importedProducts: Product[] = data.map((item, index) => ({
            id: `import-${Date.now()}-${index}`,
            barcode: item['Barcode'] || item['barcode'] || `899${Math.floor(100000000 + Math.random() * 900000000)}`,
            name: item['Nama Barang'] || item['name'] || 'Barang Tanpa Nama',
            category: item['Kategori'] || item['category'] || 'Sembako',
            buyPrice: parseFloat(item['Harga Beli (Rp)'] || item['buyPrice'] || 0),
            sellPrice: parseFloat(item['Harga Jual (Rp)'] || item['sellPrice'] || 0),
            stock: parseInt(item['Stok'] || item['stock'] || 0, 10),
            unit: item['Satuan'] || item['unit'] || 'pcs',
            aliases: item['Panggilan Suara / Alias']
              ? String(item['Panggilan Suara / Alias']).split(',').map(s => s.trim().toLowerCase())
              : []
          }));

          setProducts(prev => [...importedProducts, ...prev]);
          alert(`Berhasil mengimpor ${importedProducts.length} barang dari Excel!`);
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Gagal membaca file Excel. Pastikan format kolom sesuai.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4 text-gray-900">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <span>KATALOG & DATABASE BARANG</span>
          </h1>
          <p className="text-sm text-gray-600 font-bold mt-1">
            Kelola data barang, stok, harga beli, harga jual, dan panggilan suara
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-6 h-6" />
            <span>TAMBAH BARANG</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-sm rounded-2xl border-2 border-gray-300 transition-colors cursor-pointer flex items-center gap-2"
            title="Export Excel"
          >
            <Download className="w-5 h-5 text-blue-600" />
            <span>Export Excel</span>
          </button>

          <label className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-sm rounded-2xl border-2 border-gray-300 transition-colors cursor-pointer flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>Import Excel</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border-2 border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama barang, barcode, atau alias..."
              className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-2xl py-3 px-4 pl-11 text-gray-900 font-bold text-lg"
            />
            <Search className="w-6 h-6 text-gray-400 absolute left-3 top-3.5" />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 px-4 py-3 rounded-2xl border-2 border-gray-200 shrink-0">
            <span>Total Katalog:</span>
            <strong className="text-2xl text-blue-600 font-black">{products.length}</strong>
            <span>Barang</span>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b-2 border-gray-200">
                <th className="p-4 font-black">Barang & Barcode</th>
                <th className="p-4 font-black">Kategori</th>
                <th className="p-4 font-black">Harga Beli</th>
                <th className="p-4 font-black">Harga Jual</th>
                <th className="p-4 font-black">Stok & Satuan</th>
                <th className="p-4 font-black">Alias Suara</th>
                <th className="p-4 font-black text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-base font-bold">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="text-lg font-black text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                      <Barcode className="w-3.5 h-3.5 text-blue-600" />
                      <span>{p.barcode}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-black border border-gray-300">
                      {p.category}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-gray-500">
                    {formatRupiah(p.buyPrice)}
                  </td>

                  <td className="p-4 font-mono text-2xl font-black text-green-600">
                    {formatRupiah(p.sellPrice)}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-black font-mono ${p.stock < 10 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                        {p.stock}
                      </span>
                      <span className="text-xs text-gray-500 uppercase font-bold">{p.unit}</span>
                      {p.stock < 10 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded border border-red-300">
                          SEDIKIT!
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-xs text-gray-600 max-w-[180px]">
                    {p.aliases && p.aliases.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.aliases.map((a, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-[10px] border border-gray-200 font-bold">
                            "{a}"
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors cursor-pointer border border-blue-300"
                        title="Edit Barang"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors cursor-pointer border border-red-300"
                        title="Hapus Barang"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-4 border-blue-600 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl text-gray-900 my-auto">
            
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="text-2xl font-black uppercase tracking-wider">
                {editingProduct ? 'EDIT BARANG' : 'TAMBAH BARANG BARU'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center font-bold text-xl cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              
              <div>
                <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                  BARCODE BARANG:
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData(p => ({ ...p, barcode: e.target.value }))}
                  required
                  className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-2.5 font-mono text-gray-900 text-lg font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                  NAMA BARANG:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: Minyak Goreng Filma 1 Liter"
                  required
                  className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-2.5 text-gray-900 text-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                    KATEGORI:
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-3 py-2.5 text-gray-900 font-bold"
                  >
                    {categories.filter(c => c !== 'SEMUA').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                    SATUAN:
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(p => ({ ...p, unit: e.target.value }))}
                    className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-3 py-2.5 text-gray-900 font-bold"
                  >
                    {units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                    HARGA BELI (MODAL):
                  </label>
                  <input
                    type="number"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData(p => ({ ...p, buyPrice: parseFloat(e.target.value) || 0 }))}
                    required
                    className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-2.5 font-mono text-gray-900 text-lg font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                    HARGA JUAL:
                  </label>
                  <input
                    type="number"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData(p => ({ ...p, sellPrice: parseFloat(e.target.value) || 0 }))}
                    required
                    className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-2.5 font-mono text-green-600 text-xl font-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-gray-600 uppercase block mb-1">
                  STOK SAAT INI:
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(p => ({ ...p, stock: parseInt(e.target.value, 10) || 0 }))}
                  required
                  className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-2.5 font-mono text-gray-900 text-lg font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-blue-600 uppercase block mb-1">
                  ALIAS PANGGILAN SUARA (Pisahkan dengan koma):
                </label>
                <input
                  type="text"
                  value={formData.aliases}
                  onChange={(e) => setFormData(p => ({ ...p, aliases: e.target.value }))}
                  placeholder="Contoh: filma, minyak filma, lenga"
                  className="w-full bg-gray-50 border-2 border-gray-300 focus:border-blue-600 rounded-xl px-4 py-2.5 text-gray-900 font-medium"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Kata-kata yang sering diucapkan ibu-ibu pasar untuk barang ini.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-black rounded-2xl cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl cursor-pointer shadow-lg"
                >
                  SIMPAN BARANG
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
