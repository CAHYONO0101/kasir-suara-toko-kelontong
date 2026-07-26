import React, { useState, useMemo } from 'react';
import { 
  Mic, 
  Camera, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Search, 
  Sparkles, 
  RotateCcw, 
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { Product, CartItem, CashierSettings } from '../types';
import { formatRupiah } from '../utils/bluetoothPrinter';
import { parseVoiceLocally } from '../utils/voiceParser';
import { speakIndonesian, formatCurrencyVoice } from '../utils/speechSynthesis';

interface CashierViewProps {
  products: Product[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  settings: CashierSettings;
  onOpenVoiceModal: () => void;
  onOpenScannerModal: () => void;
  onOpenPaymentModal: () => void;
  onShowDisambiguation: (query: string, qty: number, suggestions: Product[]) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({
  products,
  cart,
  setCart,
  settings,
  onOpenVoiceModal,
  onOpenScannerModal,
  onOpenPaymentModal,
  onShowDisambiguation
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');

  // Filtered products for quick manual add
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'SEMUA' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.barcode.includes(searchTerm) ||
                          p.aliases?.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  const categories = ['SEMUA', 'Sembako', 'Minuman', 'Bumbu & Dapur', 'Makanan Ringan', 'Sabun & Kebersihan', 'Gas & Rokok'];

  // Total cart amount calculation
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  // AI Smart Suggestion based on items in cart (e.g. Indomie -> Telur, Kopi -> Gula)
  const aiRecommendation = useMemo(() => {
    if (cart.length === 0) return null;
    const itemNames = cart.map(i => i.product.name.toLowerCase());

    if (itemNames.some(n => n.includes('indomie') || n.includes('mie'))) {
      const telur = products.find(p => p.name.toLowerCase().includes('telur'));
      if (telur && !cart.some(c => c.product.id === telur.id)) {
        return { product: telur, reason: 'Pelanggan beli Mie biasanya juga beli Telur Ayam!' };
      }
    }

    if (itemNames.some(n => n.includes('kopi') || n.includes('teh'))) {
      const gula = products.find(p => p.name.toLowerCase().includes('gula'));
      if (gula && !cart.some(c => c.product.id === gula.id)) {
        return { product: gula, reason: 'Pelanggan beli Kopi/Teh sering tambah Gula Pasir!' };
      }
    }

    return null;
  }, [cart, products]);

  // Add product to cart
  const handleAddToCart = (product: Product, quantityToAdd: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantityToAdd;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: newQty * product.sellPrice
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: quantityToAdd,
            subtotal: quantityToAdd * product.sellPrice
          }
        ];
      }
    });

    if (settings.speakFeedback) {
      speakIndonesian(`${quantityToAdd} ${product.name} ditambahkan`, settings.speakFeedback);
    }
  };

  // Update item quantity directly
  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.product.sellPrice
        };
      }
      return item;
    }));
  };

  // Remove single item from cart
  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Hapus seluruh keranjang belanja?')) {
      setCart([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      
      {/* TOP ACTION BAR (GIANT 80dp+ TOUCH BUTTONS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* VOICE INPUT BUTTON (BLUE - MAIN FEATURE) */}
        <button
          onClick={onOpenVoiceModal}
          className="min-h-[80px] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl px-4 shadow-lg border-b-8 border-blue-800 flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition-transform shadow-md">
            <Mic className="w-9 h-9 animate-pulse text-blue-600" />
          </div>
          <div className="text-left">
            <div className="text-xl sm:text-2xl font-black uppercase tracking-wide leading-none">
              BICARA SUARA
            </div>
            <div className="text-xs sm:text-sm text-blue-100 font-extrabold mt-1">
              "Satu gula, dua minyak"
            </div>
          </div>
        </button>

        {/* SCAN BARCODE BUTTON (YELLOW) */}
        <button
          onClick={onOpenScannerModal}
          className="min-h-[80px] py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-950 rounded-3xl px-4 shadow-lg border-b-8 border-yellow-600 flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-950 text-yellow-400 flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition-transform shadow-md">
            <Camera className="w-9 h-9" />
          </div>
          <div className="text-left">
            <div className="text-xl sm:text-2xl font-black uppercase tracking-wide leading-none">
              SCAN BARCODE
            </div>
            <div className="text-xs sm:text-sm text-gray-900 font-extrabold mt-1">
              Pindai Kamera
            </div>
          </div>
        </button>

        {/* BAYAR BUTTON (GREEN - PROMINENT) */}
        <button
          disabled={cart.length === 0}
          onClick={onOpenPaymentModal}
          className={`min-h-[80px] py-4 rounded-3xl px-4 shadow-lg border-b-8 flex items-center justify-center gap-3 transition-all ${
            cart.length > 0
              ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white cursor-pointer active:scale-95'
              : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white text-green-600 flex items-center justify-center font-black shrink-0 shadow-md">
            <CreditCard className="w-9 h-9" />
          </div>
          <div className="text-left">
            <div className="text-2xl sm:text-3xl font-black uppercase tracking-wide leading-none">
              BAYAR
            </div>
            <div className="text-xs sm:text-sm font-extrabold mt-1">
              {cart.length > 0 ? `${cart.length} Jenis Barang` : 'Kosong'}
            </div>
          </div>
        </button>

        {/* HAPUS SEMUA BUTTON (RED) */}
        <button
          disabled={cart.length === 0}
          onClick={handleClearCart}
          className={`min-h-[80px] py-4 rounded-3xl px-4 shadow-lg border-b-8 flex items-center justify-center gap-2 transition-all text-white ${
            cart.length > 0
              ? 'bg-red-600 hover:bg-red-500 border-red-800 cursor-pointer active:scale-95'
              : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-8 h-8 shrink-0" />
          <span className="text-xl font-black uppercase tracking-wide">BATAL</span>
        </button>

      </div>

      {/* AI RECOMMENDATION BANNER */}
      {aiRecommendation && (
        <div className="bg-yellow-50 text-gray-900 p-4 rounded-3xl shadow-sm border-4 border-yellow-400 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-gray-950 flex items-center justify-center font-black shrink-0 shadow-sm text-2xl">
              💡
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 block">
                SARAN REKOMENDASI BELANJA:
              </span>
              <p className="text-lg font-black text-gray-900">
                {aiRecommendation.reason}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleAddToCart(aiRecommendation.product, 1)}
            className="px-6 py-3 bg-white border-2 border-yellow-400 hover:bg-yellow-100 rounded-2xl font-black text-base flex items-center gap-2 transition-colors cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5 text-blue-600" />
            <span>Tambah {aiRecommendation.product.name} ({formatRupiah(aiRecommendation.product.sellPrice)})</span>
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN SPLIT (CART LEFT / CATALOG RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: KERANJANG BELANJA (CART) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-5 shadow-sm space-y-4">
            
            <div className="flex justify-between items-center">
              <h2 className="text-2xl sm:text-3xl font-black uppercase border-l-8 border-blue-600 pl-4 text-gray-900">
                Keranjang Belanja
              </h2>
              <span className="text-lg font-bold bg-yellow-100 text-gray-900 px-4 py-1.5 rounded-xl border border-yellow-300">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} BARANG
              </span>
            </div>

            {/* TOTAL PRICE DISPLAY BANNER (64sp FONT) */}
            <div className="bg-black text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-gray-300 uppercase tracking-widest block">
                  TOTAL BAYAR:
                </span>
                <div className="text-[42px] sm:text-[64px] font-black text-green-400 tracking-tight leading-none font-mono">
                  {formatRupiah(totalAmount)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 font-bold block">VARIASI ITEM:</span>
                <span className="text-2xl font-black text-white">
                  {cart.length} Jenis Produk
                </span>
              </div>
            </div>

            {/* CART ITEMS LIST TABLE */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-gray-400 space-y-3 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300" />
                  <p className="text-2xl font-black text-gray-500">Keranjang Masih Kosong</p>
                  <p className="text-sm font-bold text-gray-400 max-w-sm mx-auto">
                    Ucapkan nama barang lewat tombol <strong className="text-blue-600">BICARA SUARA</strong> atau pilih barang dari katalog kanan.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors shadow-xs"
                  >
                    {/* Item Info */}
                    <div className="flex-1">
                      <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
                        {item.product.name}
                      </h3>
                      <div className="text-xl sm:text-2xl text-gray-700 font-black mt-1">
                        {formatRupiah(item.product.sellPrice)} x {item.quantity}
                      </div>
                    </div>

                    {/* Quantity Controls + Subtotal */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                      
                      {/* Subtotal (48sp price font) */}
                      <div className="text-right min-w-[140px]">
                        <div className="text-[28px] sm:text-[38px] lg:text-[48px] font-black text-blue-600 leading-none font-mono">
                          {formatRupiah(item.subtotal)}
                        </div>
                      </div>

                      {/* Quantity Touch Buttons (Giant 80px target) */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="min-h-[70px] min-w-[70px] bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-400 rounded-2xl flex items-center justify-center text-4xl font-black cursor-pointer active:scale-90 shadow-sm"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="min-h-[70px] min-w-[70px] bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-400 rounded-2xl flex items-center justify-center text-4xl font-black cursor-pointer active:scale-90 shadow-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="min-h-[70px] min-w-[60px] px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl border-2 border-red-200 transition-colors cursor-pointer flex items-center justify-center"
                        title="Hapus barang"
                      >
                        <Trash2 className="w-7 h-7" />
                      </button>

                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: KATALOG QUICK SEARCH & ADD */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-gray-100 rounded-3xl border-2 border-gray-200 p-5 shadow-sm space-y-3">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                <span>PILIH BARANG MANUAL</span>
              </h2>
              <span className="text-xs text-gray-500 font-bold">
                {filteredProducts.length} Barang
              </span>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama barang atau barcode..."
                className="w-full bg-white border-2 border-gray-300 focus:border-blue-600 rounded-2xl py-3 px-4 pl-11 text-gray-900 font-bold text-lg shadow-xs"
              />
              <Search className="w-6 h-6 text-gray-400 absolute left-3 top-3.5" />
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-colors cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => handleAddToCart(prod, 1)}
                  className="w-full min-h-[80px] text-left bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-600 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group shadow-xs active:scale-98"
                >
                  <div className="flex-1 pr-2">
                    <div className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-blue-600 leading-snug">
                      {prod.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-extrabold mt-1">
                      Stok: <span className="text-green-700 font-bold">{prod.stock} {prod.unit}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3 shrink-0">
                    <div>
                      <div className="text-2xl sm:text-[32px] lg:text-[40px] font-black text-blue-600 font-mono leading-none">
                        {formatRupiah(prod.sellPrice)}
                      </div>
                      <div className="text-xs text-gray-500 font-extrabold text-right mt-1">per {prod.unit}</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                      <Plus className="w-7 h-7" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
