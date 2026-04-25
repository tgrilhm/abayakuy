/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { SlidersHorizontal, Loader2 } from 'lucide-react';

interface CatalogProps {
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ products, loading, onProductClick }) => {
  const heroProduct = products[0];

  if (loading && products.length === 0) {
    return (
      <div className="pt-[100px] pb-20 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-on-surface-variant" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="pt-[100px] pb-20">
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 text-center py-32">
          <h2 className="text-3xl font-light mb-4">Coming Soon</h2>
          <p className="text-on-surface-variant">Our collection is being curated. Check back soon.</p>
        </section>
      </div>
    );
  }

  // Helper to get the first image URL from media array
  const getImageUrl = (product: Product) => {
    const imageMedia = product.media?.find(m => m.type === 'image');
    return imageMedia?.url || '';
  };

  return (
    <div className="pt-[100px] pb-20">
      {/* Hero Product */}
      {heroProduct && (
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 aspect-[4/5] bg-surface-highest overflow-hidden relative group cursor-pointer" onClick={() => onProductClick(heroProduct)}>
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                src={getImageUrl(heroProduct)}
                alt={heroProduct.kode}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <span className="uppercase-label text-on-surface-variant">Featured Drop</span>
              <h1 className="text-5xl font-light tracking-tight">{heroProduct.brand}</h1>
              <p className="text-xl text-on-surface-variant">EGP {heroProduct.harga.toFixed(2)}</p>
              <div className="flex flex-col gap-2">
                <p className="text-on-surface-variant text-sm">
                  <span className="uppercase-label text-[10px] text-on-surface-variant mr-2">Kode:</span>
                  {heroProduct.kode}
                </p>
                <p className="text-on-surface-variant text-sm">
                  <span className="uppercase-label text-[10px] text-on-surface-variant mr-2">Bahan:</span>
                  {heroProduct.bahan}
                </p>
                <p className="text-on-surface-variant text-sm">
                  <span className="uppercase-label text-[10px] text-on-surface-variant mr-2">Warna:</span>
                  {heroProduct.warna}
                </p>
              </div>
              <button
                onClick={() => onProductClick(heroProduct)}
                className="w-fit bg-primary text-on-primary px-12 py-4 uppercase-label hover:bg-accent transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Grid Collection */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12 border-t border-surface-high pt-12">
          <h2 className="text-3xl font-light">Explore Collection</h2>
          <button className="flex items-center gap-2 uppercase-label text-on-surface-variant hover:text-primary transition-colors">
            Filter & Sort <SlidersHorizontal size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer flex flex-col gap-4"
              onClick={() => onProductClick(product)}
            >
              <div className="aspect-[3/4] bg-surface-highest overflow-hidden relative">
                {getImageUrl(product) ? (
                  <img
                    src={getImageUrl(product)}
                    alt={product.kode}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="text-4xl">📷</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="uppercase-label text-[10px] text-on-surface-variant">{product.brand}</span>
                <h3 className="text-lg font-serif">{product.kode}</h3>
                <p className="text-sm text-on-surface-variant">EGP {product.harga.toFixed(2)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="mt-40 pt-20 pb-12 border-t border-surface-high text-center">
        <h2 className="text-6xl font-bold tracking-[0.4em] opacity-5 mb-12">ELÉGANCE</h2>
        <div className="flex justify-center gap-8 text-[10px] uppercase tracking-widest text-on-surface-variant mb-12">
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Shipping</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <p className="uppercase-label text-[9px] text-on-surface-variant/60">
          © {new Date().getFullYear()} ELÉGANCE ABAYA. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};
