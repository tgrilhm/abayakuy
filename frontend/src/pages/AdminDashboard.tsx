/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, X, Upload, Loader2, PlayCircle } from 'lucide-react';
import { Product, Media } from '../types';
import { api } from '../api';
import { motion, AnimatePresence } from 'motion/react';

interface AdminProductListProps {
  products: Product[];
  loading: boolean;
  onRefresh: () => void;
}

interface ProductFormData {
  kode: string;
  brand: string;
  bahan: string;
  ukuran: string;
  warna: string;
  harga: string;
}

const emptyForm: ProductFormData = {
  kode: '',
  brand: '',
  bahan: '',
  ukuran: '',
  warna: '',
  harga: '',
};

const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;

export const AdminProductList: React.FC<AdminProductListProps> = ({ products, loading, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter products
  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (p.kode || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.bahan || '').toLowerCase().includes(q) ||
      (p.warna || '').toLowerCase().includes(q);
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setNewFiles([]);
    setDeletedMediaIds([]);
    setError('');
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      kode: product.kode || '',
      brand: product.brand || '',
      bahan: product.bahan || '',
      ukuran: (product.ukuran || []).join(', '),
      warna: product.warna || '',
      harga: String(product.harga ?? ''),
    });
    setNewFiles([]);
    setDeletedMediaIds([]);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(emptyForm);
    setNewFiles([]);
    setDeletedMediaIds([]);
    setError('');
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);
    const existingMediaCount = editingProduct
      ? (editingProduct.media?.length || 0) - deletedMediaIds.length
      : 0;
    const totalCount = existingMediaCount + newFiles.length + selected.length;

    if (totalCount > 7) {
      setError(`Maximum 7 files allowed. You can add ${7 - existingMediaCount - newFiles.length} more.`);
      e.target.value = '';
      return;
    }

    const currentBytes = newFiles.reduce((sum, file) => sum + file.size, 0);
    const selectedBytes = selected.reduce((sum, file) => sum + file.size, 0);
    const totalBytes = currentBytes + selectedBytes;

    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      setError('Upload too large for Vercel. Please keep the total new upload under about 4 MB.');
      e.target.value = '';
      return;
    }

    setNewFiles(prev => [...prev, ...selected]);
    setError('');
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  // Remove a new file (not yet uploaded)
  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Mark existing media for deletion
  const markMediaForDeletion = (mediaId: string) => {
    setDeletedMediaIds(prev => [...prev, mediaId]);
  };

  // Undo media deletion
  const undoMediaDeletion = (mediaId: string) => {
    setDeletedMediaIds(prev => prev.filter(id => id !== mediaId));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('kode', formData.kode);
      fd.append('brand', formData.brand);
      fd.append('bahan', formData.bahan);
      fd.append('ukuran', JSON.stringify(formData.ukuran.split(',').map(s => s.trim()).filter(Boolean)));
      fd.append('warna', formData.warna);
      fd.append('harga', formData.harga);

      // Append new files
      newFiles.forEach(file => {
        fd.append('media', file);
      });

      if (editingProduct) {
        // Include deleted media IDs
        if (deletedMediaIds.length > 0) {
          fd.append('deletedMedia', JSON.stringify(deletedMediaIds));
        }
        await api.updateProduct(editingProduct.id, fd);
        showToast('Product updated successfully!');
      } else {
        await api.createProduct(fd);
        showToast('Product created successfully!');
      }

      closeModal();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete product "${product.kode}"? This cannot be undone.`)) return;

    try {
      await api.deleteProduct(product.id);
      showToast('Product deleted successfully!');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const getImageUrl = (product: Product) => {
    const img = product.media?.find(m => m.type === 'image');
    return img?.url || '';
  };

  return (
      <div className="flex-grow p-6 md:p-12 overflow-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[200] px-6 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-lexend mb-2">Product Catalog</h2>
          <p className="text-on-surface-variant text-sm">Manage your abaya collection, prices, and inventory.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary text-on-primary px-6 py-3 uppercase-label flex items-center gap-2 hover:bg-accent transition-colors"
        >
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-lowest p-4 border border-surface-high flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="relative w-full flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Search by Kode, Brand, Bahan, or Warna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-b border-surface-variant bg-transparent focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
        <span className="text-xs text-on-surface-variant whitespace-nowrap">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface-lowest border border-surface-high overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-on-surface-variant" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-sm">{products.length === 0 ? 'No products yet. Click "Add New Product" to get started!' : 'No products match your search.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-low border-b border-surface-high">
                <tr>
                  <th className="p-4 uppercase-label text-[10px]">Product</th>
                  <th className="p-4 uppercase-label text-[10px]">Kode</th>
                  <th className="p-4 uppercase-label text-[10px]">Bahan</th>
                  <th className="p-4 uppercase-label text-[10px]">Warna</th>
                  <th className="p-4 uppercase-label text-[10px]">Ukuran</th>
                  <th className="p-4 uppercase-label text-[10px]">Harga</th>
                  <th className="p-4 uppercase-label text-[10px]">Media</th>
                  <th className="p-4 uppercase-label text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-high">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-surface transition-colors group">
                    <td className="p-4 flex items-center gap-4">
                      <div className="w-12 h-16 bg-surface-high overflow-hidden flex-shrink-0">
                        {getImageUrl(product) ? (
                          <img src={getImageUrl(product)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-lg">📷</div>
                        )}
                      </div>
                      <div>
                        <p className="font-lexend text-sm font-medium">{product.brand || 'Unknown Brand'}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{product.kode || 'Untitled'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{product.kode || 'Untitled'}</td>
                    <td className="p-4 text-sm">{product.bahan || 'Not specified'}</td>
                    <td className="p-4 text-sm">{product.warna || 'Not specified'}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {(product.ukuran || []).map(size => (
                          <span key={size} className="px-2 py-0.5 text-[10px] uppercase font-bold bg-surface-highest">{size}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium">EGP {Number(product.harga ?? 0).toFixed(2)}</td>
                    <td className="p-4">
                      <span className="text-xs text-on-surface-variant">
                        {product.media?.length || 0} file{(product.media?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-on-surface-variant hover:text-primary"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-surface-high flex justify-between items-center text-xs text-on-surface-variant">
          <span>Showing {filtered.length} of {products.length} products</span>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-surface-lowest border border-surface-high w-full max-w-2xl shadow-lg mb-12"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-surface-high">
                <h3 className="text-xl font-lexend">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={closeModal} className="p-2 text-on-surface-variant hover:text-primary">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Kode */}
                <div>
                  <label className="uppercase-label text-[10px] mb-1 block">Kode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABY-100"
                    value={formData.kode}
                    onChange={(e) => setFormData(prev => ({ ...prev, kode: e.target.value }))}
                    className="w-full border-b border-surface-variant py-2 focus:outline-none focus:border-primary text-sm bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Brand */}
                  <div>
                    <label className="uppercase-label text-[10px] mb-1 block">Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABAYAKUY"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full border-b border-surface-variant py-2 bg-transparent text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  {/* Bahan */}
                  <div>
                    <label className="uppercase-label text-[10px] mb-1 block">Bahan *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premium Nida"
                      value={formData.bahan}
                      onChange={(e) => setFormData(prev => ({ ...prev, bahan: e.target.value }))}
                      className="w-full border-b border-surface-variant py-2 bg-transparent text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Warna */}
                  <div>
                    <label className="uppercase-label text-[10px] mb-1 block">Warna *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hitam"
                      value={formData.warna}
                      onChange={(e) => setFormData(prev => ({ ...prev, warna: e.target.value }))}
                      className="w-full border-b border-surface-variant py-2 bg-transparent text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  {/* Harga */}
                  <div>
                    <label className="uppercase-label text-[10px] mb-1 block">Harga (EGP) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={formData.harga}
                      onChange={(e) => setFormData(prev => ({ ...prev, harga: e.target.value }))}
                      className="w-full border-b border-surface-variant py-2 bg-transparent text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Ukuran */}
                <div>
                  <label className="uppercase-label text-[10px] mb-1 block">Ukuran * (comma separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S, M, L, XL"
                    value={formData.ukuran}
                    onChange={(e) => setFormData(prev => ({ ...prev, ukuran: e.target.value }))}
                    className="w-full border-b border-surface-variant py-2 bg-transparent text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Media Upload */}
                <div>
                  <label className="uppercase-label text-[10px] mb-3 block">
                    Media (Photos & Videos — max 7)
                  </label>

                  {/* Existing media (when editing) */}
                  {editingProduct && (editingProduct.media?.length || 0) > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-on-surface-variant mb-2">Current media:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {(editingProduct.media || []).map((media) => {
                          const isDeleted = deletedMediaIds.includes(media.id);
                          return (
                            <div
                              key={media.id}
                              className={`relative aspect-square bg-surface-highest overflow-hidden border ${
                                isDeleted ? 'opacity-30 border-red-400' : 'border-surface-high'
                              }`}
                            >
                              {media.type === 'video' ? (
                                <>
                                  <video src={media.url} className="w-full h-full object-cover" />
                                  <PlayCircle size={16} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </>
                              ) : (
                                <img src={media.url} alt="" className="w-full h-full object-cover" />
                              )}
                              <button
                                type="button"
                                onClick={() => isDeleted ? undoMediaDeletion(media.id) : markMediaForDeletion(media.id)}
                                className={`absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-white text-xs ${
                                  isDeleted ? 'bg-green-600' : 'bg-red-600/80 hover:bg-red-600'
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
                      <p className="text-xs text-on-surface-variant mb-2">New files to upload:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {newFiles.map((file, index) => (
                          <div key={index} className="relative aspect-square bg-surface-highest overflow-hidden border border-primary/30">
                            {file.type.startsWith('video/') ? (
                              <>
                                <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                <PlayCircle size={16} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              </>
                            ) : (
                              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeNewFile(index)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-surface-high hover:border-primary transition-colors flex items-center justify-center gap-2 text-sm text-on-surface-variant"
                  >
                    <Upload size={16} />
                    Click to add photos or videos
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 border border-surface-high uppercase-label text-[10px] hover:bg-surface-low transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-primary text-on-primary uppercase-label text-[10px] hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      editingProduct ? 'Update Product' : 'Create Product'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
