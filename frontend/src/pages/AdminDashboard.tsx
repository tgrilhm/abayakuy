/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Upload, Loader2, PlayCircle, Package, Layout } from 'lucide-react';
import { Product, KATEGORI_OPTIONS, UKURAN_OPTIONS, BAHAN_OPTIONS, WARNA_OPTIONS, Ukuran, Kategori, Bahan, Warna, formatUkuranDisplay } from '../types';
import { api } from '../api';
import { motion, AnimatePresence } from 'motion/react';

interface AdminProductListProps {
  products: Product[];
  loading: boolean;
  onRefresh: () => void;
}

interface ProductFormData {
  kode: string;
  nama: string;
  brand: string;
  shopeeUrl: string;
  bahan: Bahan | '';
  ukuran: Ukuran[];
  warna: Warna[];
  harga: string;
  kategori: Kategori | '';
  deskripsi: string;
  isAvailable: boolean;
}

const emptyForm: ProductFormData = {
  kode: '',
  nama: '',
  brand: '',
  shopeeUrl: '',
  bahan: '',
  ukuran: [],
  warna: [],
  harga: '',
  kategori: '',
  deskripsi: '',
  isAvailable: true,
};

// ─── Field component for consistent styling ───
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.18em] uppercase font-semibold text-stone-400 font-sans">
        {label}
        {required && <span className="text-stone-300 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-stone-50 border border-stone-200 px-3 py-2.5 text-[13px] font-sans text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-800 focus:bg-white transition-all duration-200';

// ─── Reusable toggle row for the popover ───
type ToggleColor = 'amber' | 'rose' | 'violet' | 'emerald';
const COLOR_MAP: Record<ToggleColor, string> = {
  amber:   'bg-amber-500 border-amber-500',
  rose:    'bg-rose-500 border-rose-500',
  violet:  'bg-violet-500 border-violet-500',
  emerald: 'bg-emerald-500 border-emerald-500',
};
function ToggleRow({ label, sub, active, color, onClick }: {
  label: string; sub?: string; active: boolean; color: ToggleColor; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-3 py-2 hover:bg-stone-50 transition-colors gap-2">
      <div className="flex flex-col items-start min-w-0">
        <span className="font-sans text-[12px] text-stone-700 leading-tight">{label}</span>
        {sub && <span className="font-sans text-[9px] text-stone-400 leading-tight">{sub}</span>}
      </div>
      <span className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
        active ? `${COLOR_MAP[color]} text-white` : 'border-stone-300'
      }`}>
        {active && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    </button>
  );
}

export const AdminProductList: React.FC<AdminProductListProps> = ({ products, loading, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [openPageMenuId, setOpenPageMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = showDrawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showDrawer]);

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.kode || '').toLowerCase().includes(q) ||
      (p.nama || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.bahan || '').toLowerCase().includes(q) ||
      (Array.isArray(p.warna) ? p.warna.join(' ') : (p.warna || '')).toLowerCase().includes(q) ||
      (p.kategori || '').toLowerCase().includes(q) ||
      (p.deskripsi || '').toLowerCase().includes(q)
    );
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddDrawer = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setNewFiles([]);
    setDeletedMediaIds([]);
    setError('');
    setShowDrawer(true);
  };

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      kode: product.kode || '',
      nama: product.nama || '',
      brand: product.brand || '',
      shopeeUrl: product.shopeeUrl || '',
      bahan: (product.bahan as Bahan) || '',
      ukuran: (product.ukuran || []) as Ukuran[],
      warna: Array.isArray(product.warna) ? product.warna as Warna[] : (product.warna ? [product.warna as Warna] : []),
      harga: String(product.harga ?? ''),
      kategori: (product.kategori as Kategori) || '',
      deskripsi: product.deskripsi || '',
      isAvailable: product.isAvailable ?? true,
    });
    setNewFiles([]);
    setDeletedMediaIds([]);
    setError('');
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditingProduct(null);
    setFormData(emptyForm);
    setNewFiles([]);
    setDeletedMediaIds([]);
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const existingCount = editingProduct
      ? (editingProduct.media?.length || 0) - deletedMediaIds.length
      : 0;
    const totalCount = existingCount + newFiles.length + selected.length;

    if (totalCount > 10) {
      setError(`Max 10 files. You can add ${10 - existingCount - newFiles.length} more.`);
      e.target.value = '';
      return;
    }

    setNewFiles((prev) => [...prev, ...selected]);
    setError('');
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('kode', formData.kode);
      fd.append('nama', formData.nama);
      fd.append('brand', formData.brand);
      fd.append('shopeeUrl', formData.shopeeUrl);
      fd.append('bahan', formData.bahan);
      fd.append('ukuran', JSON.stringify(formData.ukuran));
      fd.append('warna', JSON.stringify(formData.warna));
      fd.append('harga', formData.harga);
      if (formData.kategori) fd.append('kategori', formData.kategori);
      if (formData.deskripsi) fd.append('deskripsi', formData.deskripsi);
      fd.append('isAvailable', String(formData.isAvailable));
      newFiles.forEach((file) => fd.append('media', file));

      if (editingProduct) {
        if (deletedMediaIds.length > 0) fd.append('deletedMedia', JSON.stringify(deletedMediaIds));
        await api.updateProduct(editingProduct.id, fd);
        showToast('Product updated successfully!');
      } else {
        await api.createProduct(fd);
        showToast('Product created successfully!');
      }

      closeDrawer();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.nama || product.kode}"? This cannot be undone.`)) return;
    try {
      await api.deleteProduct(product.id);
      showToast('Product deleted.');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleTogglePage = async (product: Product, flag: 'isTrending' | 'isSale' | 'isHeroFeatured' | 'isVisible' | 'isAvailable') => {
    try {
      const newValue = !product[flag];
      await api.updateProductPages(product.id, { [flag]: newValue });
      const labels: Record<string, string> = {
        isTrending: 'Trending Now',
        isSale: 'Sale',
        isHeroFeatured: 'Home Hero',
        isVisible: 'Visibility',
        isAvailable: 'Availability',
      };
      showToast(newValue ? `Added to ${labels[flag]}` : `Removed from ${labels[flag]}`);
      if (flag === 'isAvailable') {
        showToast(newValue ? 'Product marked as Available' : 'Product marked as Sold Out');
      }
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    }
  };

  const getImageUrl = (product: Product) => product.media?.find((m) => m.type === 'image')?.url || '';

  const set = (key: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="flex-grow overflow-auto bg-[#faf9f7]">
      {/* ─── Toast ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-5 right-5 z-[300] px-5 py-3 text-[12px] font-sans font-medium tracking-wide border ${
              toast.type === 'success'
                ? 'bg-white text-stone-800 border-stone-200 shadow-md'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Page Header ─── */}
      <div className="px-8 pt-10 pb-6 border-b border-stone-200 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-[9px] tracking-[0.35em] uppercase text-stone-400 font-sans mb-1">Admin</p>
            <h2 className="font-serif text-2xl text-stone-900">Product Catalog</h2>
          </div>
          <button
            onClick={openAddDrawer}
            className="flex items-center gap-2 bg-stone-900 text-white font-sans text-[11px] tracking-[0.2em] uppercase px-6 py-3 hover:bg-stone-700 transition-colors duration-300"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={15} />
          <input
            type="text"
            placeholder="Search by name, kode, brand, kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 bg-stone-50 text-[13px] font-sans text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-all duration-200"
          />
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="px-8 py-6">
        <div className="bg-white border border-stone-200">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="animate-spin text-stone-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-stone-400">
              <Package size={32} className="mx-auto mb-4 opacity-30" />
              <p className="font-sans text-sm">
                {products.length === 0 ? 'No products yet. Add your first product.' : 'No results for your search.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-100">
                    {['Product', 'Kode', 'Kategori', 'Bahan', 'Warna', 'Ukuran', 'Harga', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-[9px] tracking-[0.2em] uppercase text-stone-400 font-sans font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-13 bg-stone-100 overflow-hidden flex-shrink-0 aspect-[3/4]">
                            {getImageUrl(product) ? (
                              <img src={getImageUrl(product)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">—</div>
                            )}
                          </div>
                          <div>
                            <p className="font-sans text-[13px] font-medium text-stone-800 leading-tight">
                              {product.nama || product.brand || 'Untitled'}
                            </p>
                            <p className="font-sans text-[11px] text-stone-400 mt-0.5">{product.kode || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-sans text-[12px] text-stone-600">{product.kode || '—'}</td>
                      <td className="px-4 py-3">
                        {product.kategori ? (
                          <span className="font-sans text-[10px] tracking-[0.1em] uppercase bg-stone-100 text-stone-600 px-2 py-1">
                            {product.kategori}
                          </span>
                        ) : <span className="text-stone-300 text-[12px]">—</span>}
                      </td>
                      <td className="px-4 py-3 font-sans text-[12px] text-stone-600">{product.bahan || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(product.warna || []).map((w) => (
                            <span key={w} className="font-sans text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 border border-stone-200">
                              {w}
                            </span>
                          ))}
                          {(!product.warna || product.warna.length === 0) && <span className="text-stone-300 text-[12px]">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(product.ukuran || []).map((size) => (
                            <span key={size} className="font-sans text-[9px] tracking-widest uppercase bg-stone-900 text-white px-1.5 py-0.5">
                              {formatUkuranDisplay(size)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-sans text-[13px] font-medium text-stone-800">
                        Rp {Number(product.harga ?? 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">

                          {/* ── Page badges ── */}
                          <div className="flex items-center gap-1 mr-1">
                            {product.isHeroFeatured && (
                              <span className="font-sans text-[8px] tracking-[0.1em] uppercase bg-violet-100 text-violet-700 px-1.5 py-0.5 border border-violet-200">
                                Hero
                              </span>
                            )}
                            {product.isTrending && (
                              <span className="font-sans text-[8px] tracking-[0.1em] uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 border border-amber-200">
                                Trending
                              </span>
                            )}
                            {product.isSale && (
                              <span className="font-sans text-[8px] tracking-[0.1em] uppercase bg-rose-100 text-rose-700 px-1.5 py-0.5 border border-rose-200">
                                Sale
                              </span>
                            )}
                            {!product.isAvailable && (
                              <span className="font-sans text-[8px] tracking-[0.1em] uppercase bg-red-100 text-red-700 px-1.5 py-0.5 border border-red-200">
                                Sold Out
                              </span>
                            )}
                            {!product.isVisible && (
                              <span className="font-sans text-[8px] tracking-[0.1em] uppercase bg-stone-100 text-stone-500 px-1.5 py-0.5 border border-stone-300">
                                Hidden
                              </span>
                            )}
                          </div>

                          {/* ── Assign to page button + popover ── */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenPageMenuId(openPageMenuId === product.id ? null : product.id)}
                              className={`w-8 h-8 flex items-center justify-center rounded border transition-all duration-150 ${
                                openPageMenuId === product.id
                                  ? 'border-stone-900 bg-stone-900 text-white'
                                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-900 hover:text-stone-900 hover:bg-stone-50'
                              }`}
                              title="Assign to page"
                            >
                              <Layout size={13} />
                            </button>
                            {/* Click-based popover */}
                            {openPageMenuId === product.id && (
                              <>
                                {/* Backdrop to close */}
                                <div className="fixed inset-0 z-10" onClick={() => setOpenPageMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1.5 z-[500] bg-white border border-stone-200 shadow-xl w-52">
                                  <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between">
                                    <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-stone-400">Assign to page</p>
                                    <button onClick={() => setOpenPageMenuId(null)} className="text-stone-300 hover:text-stone-600">
                                      <X size={12} />
                                    </button>
                                  </div>
                                  <div className="py-1">
                                    <ToggleRow label="Trending Now" active={product.isTrending} color="amber" onClick={() => handleTogglePage(product, 'isTrending')} />
                                    <ToggleRow label="Sale" active={product.isSale} color="rose" onClick={() => handleTogglePage(product, 'isSale')} />
                                  </div>
                                  <div className="border-t border-stone-100 py-1">
                                    <ToggleRow label="Home Hero" sub="Nama tampil di hero" active={product.isHeroFeatured} color="violet" onClick={() => handleTogglePage(product, 'isHeroFeatured')} />
                                    <ToggleRow label="Visible" sub="Tampil di katalog" active={product.isVisible} color="emerald" onClick={() => handleTogglePage(product, 'isVisible')} />
                                    <ToggleRow label="In Stock" sub="Tersedia untuk dipesan" active={product.isAvailable} color="emerald" onClick={() => handleTogglePage(product, 'isAvailable')} />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          <button
                            onClick={() => openEditDrawer(product)}
                            className="w-8 h-8 flex items-center justify-center rounded border border-stone-200 bg-white text-stone-500 hover:border-stone-900 hover:text-stone-900 hover:bg-stone-50 transition-all duration-150"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="w-8 h-8 flex items-center justify-center rounded border border-red-100 bg-white text-red-400 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 py-3 border-t border-stone-100 flex justify-between items-center">
            <span className="font-sans text-[11px] text-stone-400">
              {filtered.length} of {products.length} products
            </span>
          </div>
        </div>
      </div>

      {/* ─── Side Drawer ─── */}
      <AnimatePresence>
        {showDrawer && (
          <>
            {/* Dim overlay — solid, no blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/40"
              onClick={closeDrawer}
            />

            {/* Drawer panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full z-[110] w-full max-w-[560px] bg-white flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-stone-100 flex-shrink-0">
                <div>
                  <p className="text-[9px] tracking-[0.35em] uppercase text-stone-400 font-sans mb-0.5">
                    {editingProduct ? 'Editing' : 'New Entry'}
                  </p>
                  <h3 className="font-serif text-xl text-stone-900">
                    {editingProduct ? (editingProduct.nama || editingProduct.kode || 'Product') : 'Add Product'}
                  </h3>
                </div>
                <button
                  onClick={closeDrawer}
                  className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body — scrollable */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

                  {/* Row: Kode + Nama */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Kode" required>
                      <input type="text" required placeholder="ABY-100" value={formData.kode} onChange={set('kode')} className={inputCls} />
                    </Field>
                    <Field label="Nama">
                      <input type="text" placeholder="Display name" value={formData.nama} onChange={set('nama')} className={inputCls} />
                    </Field>
                  </div>

                  <Field label="Shopee Link">
                    <input
                      type="text"
                      placeholder="https://shopee.co.id/..."
                      value={formData.shopeeUrl}
                      onChange={set('shopeeUrl')}
                      className={inputCls}
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </Field>

                  {/* Row: Brand + Bahan */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Brand" required>
                      <input type="text" required placeholder="ABAYAKUY" value={formData.brand} onChange={set('brand')} className={inputCls} />
                    </Field>
                    <Field label="Bahan" required>
                      <select
                        required
                        value={formData.bahan}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bahan: e.target.value as Bahan | '' }))}
                        className={inputCls}
                      >
                        <option value="">— Pilih bahan —</option>
                        {BAHAN_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {/* Row: Warna + Harga — removed duplicate, Harga is in Kategori row below */}

                  {/* Warna — checkbox grid */}
                  <Field label="Warna" required>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {WARNA_OPTIONS.map((color) => {
                        const checked = formData.warna.includes(color);
                        return (
                          <label
                            key={color}
                            className={`flex items-center justify-center py-2 cursor-pointer border transition-all duration-150 font-sans text-[11px] select-none ${
                              checked
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-500 hover:text-stone-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  warna: checked
                                    ? prev.warna.filter((w) => w !== color)
                                    : [...prev.warna, color],
                                }))
                              }
                            />
                            {color}
                          </label>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Row: Kategori + Stok */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Kategori">
                      <select
                        value={formData.kategori}
                        onChange={(e) => setFormData((prev) => ({ ...prev, kategori: e.target.value as Kategori | '' }))}
                        className={inputCls}
                      >
                        <option value="">— Select —</option>
                        {KATEGORI_OPTIONS.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Harga (Rp)" required>
                      <input type="number" step="0.01" required placeholder="0.00" value={formData.harga} onChange={set('harga')} className={inputCls} />
                    </Field>
                  </div>

                  {/* Ukuran — checkbox grid */}
                  <Field label="Ukuran" required>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {UKURAN_OPTIONS.map((size) => {
                        const checked = formData.ukuran.includes(size);
                        return (
                          <label
                            key={size}
                            className={`flex items-center justify-center py-2.5 cursor-pointer border transition-all duration-150 font-sans text-[11px] tracking-[0.1em] uppercase select-none ${
                              checked
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-500 hover:text-stone-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  ukuran: checked
                                    ? prev.ukuran.filter((u) => u !== size)
                                    : [...prev.ukuran, size],
                                }))
                              }
                            />
                            {size}
                          </label>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label="Availability">
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, isAvailable: true }))}
                        className={`py-2.5 border transition-all duration-150 font-sans text-[11px] tracking-[0.12em] uppercase ${
                          formData.isAvailable
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Available
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, isAvailable: false }))}
                        className={`py-2.5 border transition-all duration-150 font-sans text-[11px] tracking-[0.12em] uppercase ${
                          !formData.isAvailable
                            ? 'bg-rose-700 text-white border-rose-700'
                            : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Sold Out
                      </button>
                    </div>
                  </Field>

                  {/* Deskripsi */}
                  <Field label="Deskripsi">
                    <textarea
                      rows={3}
                      placeholder="Describe the product..."
                      value={formData.deskripsi}
                      onChange={set('deskripsi')}
                      className={`${inputCls} resize-none`}
                    />
                  </Field>

                  {/* ─── Media ─── */}
                  <div>
                    <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-stone-400 font-sans mb-3">
                      Media <span className="text-stone-300 font-normal normal-case tracking-normal">— max 10 files</span>
                    </p>

                    {/* Existing media */}
                    {editingProduct && (editingProduct.media?.length || 0) > 0 && (
                      <div className="mb-4">
                        <p className="font-sans text-[11px] text-stone-400 mb-2">Current files</p>
                        <div className="grid grid-cols-5 gap-2">
                          {(editingProduct.media || []).map((media) => {
                            const isDeleted = deletedMediaIds.includes(media.id);
                            return (
                              <div
                                key={media.id}
                                className={`relative aspect-square bg-stone-100 overflow-hidden border transition-all ${
                                  isDeleted ? 'opacity-30 border-red-300' : 'border-stone-200'
                                }`}
                              >
                                {media.type === 'video' ? (
                                  <>
                                    <video src={media.url} className="w-full h-full object-cover" />
                                    <PlayCircle size={14} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow" />
                                  </>
                                ) : (
                                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => isDeleted ? setDeletedMediaIds(p => p.filter(id => id !== media.id)) : setDeletedMediaIds(p => [...p, media.id])}
                                  className={`absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-white text-[10px] leading-none ${
                                    isDeleted ? 'bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                  }`}
                                >
                                  {isDeleted ? '↩' : '×'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* New files preview */}
                    {newFiles.length > 0 && (
                      <div className="mb-4">
                        <p className="font-sans text-[11px] text-stone-400 mb-2">New files</p>
                        <div className="grid grid-cols-5 gap-2">
                          {newFiles.map((file, index) => (
                            <div key={index} className="relative aspect-square bg-stone-100 overflow-hidden border border-stone-800/20">
                              {file.type.startsWith('video/') ? (
                                <>
                                  <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                  <PlayCircle size={14} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow" />
                                </>
                              ) : (
                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                              )}
                              <button
                                type="button"
                                onClick={() => setNewFiles((p) => p.filter((_, i) => i !== index))}
                                className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-[10px] leading-none"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload zone */}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" multiple className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-5 border border-dashed border-stone-300 hover:border-stone-800 hover:bg-stone-50 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-stone-700 group"
                    >
                      <Upload size={18} className="group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-sans text-[11px] tracking-[0.1em] uppercase">Click to upload photos or videos</span>
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="font-sans text-[12px] text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                      {error}
                    </div>
                  )}
                </div>

                {/* ─── Sticky Footer ─── */}
                <div className="flex-shrink-0 px-8 py-5 border-t border-stone-100 bg-white flex gap-3">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="flex-1 py-3 border border-stone-200 text-stone-600 font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-stone-50 hover:border-stone-400 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-2 flex-grow-[2] py-3 bg-stone-900 text-white font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <><Loader2 size={13} className="animate-spin" /> Saving…</>
                    ) : editingProduct ? (
                      'Update Product'
                    ) : (
                      'Create Product'
                    )}
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
