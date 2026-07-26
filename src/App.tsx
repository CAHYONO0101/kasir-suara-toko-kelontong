/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CashierView } from './components/CashierView';
import { InventoryManager } from './components/InventoryManager';
import { SalesHistory } from './components/SalesHistory';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { BackupRestore } from './components/BackupRestore';
import { SettingsModal } from './components/SettingsModal';
import { VoiceInputModal } from './components/VoiceInputModal';
import { DisambiguationModal } from './components/DisambiguationModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { CameraScannerModal } from './components/CameraScannerModal';
import { PinLoginModal } from './components/PinLoginModal';

import { Product, CartItem, Transaction, CashierSettings } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { parseVoiceLocally } from './utils/voiceParser';
import { speakIndonesian, formatCurrencyVoice } from './utils/speechSynthesis';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'kasir' | 'katalog' | 'riwayat' | 'laporan' | 'backup' | 'pengaturan'>('kasir');

  // Persistent Products state
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos_products_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PRODUCTS;
  });

  // Persistent Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pos_transactions_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Persistent Settings state
  const [settings, setSettings] = useState<CashierSettings>(() => {
    const saved = localStorage.getItem('pos_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      tokoName: 'TOKO BERKAH JAYA',
      tokoAddress: 'Jl. Pasar Gede No. 45, Solo',
      tokoPhone: '0812-3456-7890',
      cashierName: 'Mbak Sri',
      requirePin: false,
      pinCode: '1234',
      speakFeedback: true,
      fontSizeLarge: true,
      autoBackup: true,
      qrisNmr: '1029384756'
    };
  });

  // Current Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals visibility states
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [isTerminalLocked, setIsTerminalLocked] = useState<boolean>(false);

  // Disambiguation modal state
  const [disambiguationState, setDisambiguationState] = useState<{
    isOpen: boolean;
    spokenQuery: string;
    quantity: number;
    suggestions: Product[];
  }>({
    isOpen: false,
    spokenQuery: '',
    quantity: 1,
    suggestions: []
  });

  // Sync products to LocalStorage
  useEffect(() => {
    localStorage.setItem('pos_products_db', JSON.stringify(products));
  }, [products]);

  // Sync transactions to LocalStorage
  useEffect(() => {
    localStorage.setItem('pos_transactions_db', JSON.stringify(transactions));
  }, [transactions]);

  // Sync settings to LocalStorage
  useEffect(() => {
    localStorage.setItem('pos_settings', JSON.stringify(settings));
  }, [settings]);

  // Helper to add product to cart
  const addProductToCart = (product: Product, quantityToAdd: number = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantityToAdd;
        updated[existingIdx] = {
          ...updated[existingIdx],
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

  // Voice Processing Pipeline (Local Fuse.js + Optional AI Server Fallback)
  const handleProcessVoiceTranscript = async (transcript: string) => {
    if (!transcript) return;

    // First attempt fast local fuzzy parse
    const localResult = parseVoiceLocally(transcript, products);

    if (localResult.parsedItems && localResult.parsedItems.length > 0) {
      let addedCount = 0;

      for (const item of localResult.parsedItems) {
        if (item.matchedProduct && item.confidence >= 0.5) {
          addProductToCart(item.matchedProduct, item.quantity);
          addedCount++;
        } else if (item.suggestions && item.suggestions.length > 0) {
          // Open Disambiguation Popup for low confidence / ambiguous voice matches
          setDisambiguationState({
            isOpen: true,
            spokenQuery: item.spokenQuery,
            quantity: item.quantity,
            suggestions: item.suggestions
          });
          return;
        }
      }

      if (addedCount > 0 && settings.speakFeedback) {
        speakIndonesian(`${addedCount} barang masuk keranjang`, settings.speakFeedback);
      }
    } else {
      // Fallback API call to server Gemini AI parser
      try {
        const res = await fetch('/api/parse-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript, catalog: products })
        });

        if (res.ok) {
          const aiParsed = await res.json();
          if (aiParsed.parsedItems && aiParsed.parsedItems.length > 0) {
            for (const item of aiParsed.parsedItems) {
              const matched = products.find(p => p.id === item.matchedProductId || p.name.toLowerCase().includes(item.spokenQuery?.toLowerCase()));
              if (matched) {
                addProductToCart(matched, item.quantity || 1);
              }
            }
          }
        }
      } catch (err) {
        console.warn('AI Voice fallback failed:', err);
      }
    }
  };

  // Barcode Scanner Handler
  const handleScanBarcode = (barcode: string) => {
    const matched = products.find(p => p.barcode === barcode || p.id === barcode);
    if (matched) {
      addProductToCart(matched, 1);
    } else {
      alert(`Barang dengan barcode ${barcode} tidak ditemukan di database.`);
    }
  };

  // Complete Payment & Save Transaction
  const handleCompletePayment = (
    paymentMethod: 'cash' | 'qris' | 'transfer',
    paidAmount: number,
    changeAmount: number
  ) => {
    const totalAmount = cart.reduce((s, i) => s + i.subtotal, 0);
    const totalCost = cart.reduce((s, i) => s + (i.product.buyPrice * i.quantity), 0);
    const profit = totalAmount - totalCost;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber: `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random()*900)}`,
      timestamp: new Date().toISOString(),
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        unit: i.product.unit,
        sellPrice: i.product.sellPrice,
        buyPrice: i.product.buyPrice,
        quantity: i.quantity,
        subtotal: i.subtotal
      })),
      totalAmount,
      totalCost,
      profit,
      paymentMethod,
      paidAmount,
      changeAmount,
      cashierName: settings.cashierName,
      tokoName: settings.tokoName
    };

    // Update stock in products database
    setProducts(prev => prev.map(p => {
      const itemInCart = cart.find(c => c.product.id === p.id);
      if (itemInCart) {
        return {
          ...p,
          stock: Math.max(0, p.stock - itemInCart.quantity)
        };
      }
      return p;
    }));

    // Add to transactions history
    setTransactions(prev => [newTx, ...prev]);

    // Speak payment voice readout
    if (settings.speakFeedback) {
      speakIndonesian(`Transaksi selesai. ${formatCurrencyVoice(totalAmount)}`, settings.speakFeedback);
    }

    // Close payment modal, show receipt modal & clear cart
    setIsPaymentModalOpen(false);
    setActiveReceipt(newTx);
    setCart([]);
  };

  // Reset to default sample data
  const handleResetDefaultData = () => {
    if (confirm('Reset seluruh database barang ke 35+ contoh produk pasar tradisional?')) {
      setProducts(INITIAL_PRODUCTS);
      alert('Database barang telah di-reset ke sample data pasar!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans selection:bg-blue-600 selection:text-white pb-16">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onLockTerminal={() => setIsTerminalLocked(true)}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
      />

      {/* Main Tab Content View */}
      <main className="animate-in fade-in duration-200">
        {activeTab === 'kasir' && (
          <CashierView
            products={products}
            cart={cart}
            setCart={setCart}
            settings={settings}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenScannerModal={() => setIsScannerModalOpen(true)}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onShowDisambiguation={(spokenQuery, quantity, suggestions) => {
              setDisambiguationState({ isOpen: true, spokenQuery, quantity, suggestions });
            }}
          />
        )}

        {activeTab === 'katalog' && (
          <InventoryManager
            products={products}
            setProducts={setProducts}
          />
        )}

        {activeTab === 'riwayat' && (
          <SalesHistory
            transactions={transactions}
            onViewReceipt={(tx) => setActiveReceipt(tx)}
          />
        )}

        {activeTab === 'laporan' && (
          <DashboardAnalytics
            transactions={transactions}
            products={products}
          />
        )}

        {activeTab === 'backup' && (
          <BackupRestore
            products={products}
            setProducts={setProducts}
            transactions={transactions}
            setTransactions={setTransactions}
            settings={settings}
            onResetDefaultData={handleResetDefaultData}
          />
        )}

        {activeTab === 'pengaturan' && (
          <SettingsModal
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </main>

      {/* Modals */}

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onProcessTranscript={handleProcessVoiceTranscript}
        products={products}
      />

      {/* Disambiguation Modal ("Apakah Maksud Anda?") */}
      <DisambiguationModal
        isOpen={disambiguationState.isOpen}
        spokenQuery={disambiguationState.spokenQuery}
        quantity={disambiguationState.quantity}
        suggestions={disambiguationState.suggestions}
        onSelectProduct={(prod, qty) => {
          addProductToCart(prod, qty);
          setDisambiguationState(p => ({ ...p, isOpen: false }));
        }}
        onCancel={() => setDisambiguationState(p => ({ ...p, isOpen: false }))}
      />

      {/* Camera Barcode Scanner Modal */}
      <CameraScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        products={products}
        onScanBarcode={handleScanBarcode}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={cart}
        totalAmount={cart.reduce((s, i) => s + i.subtotal, 0)}
        settings={settings}
        onCompletePayment={handleCompletePayment}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(activeReceipt)}
        onClose={() => setActiveReceipt(null)}
        transaction={activeReceipt}
      />

      {/* PIN Terminal Lock Modal */}
      <PinLoginModal
        isOpen={isTerminalLocked}
        settings={settings}
        onUnlock={() => setIsTerminalLocked(false)}
      />

    </div>
  );
}
