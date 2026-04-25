/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product, Media } from '../types';
import { PlayCircle, ArrowLeft } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(
    product.media?.[0] || null
  );

  const images = product.media?.filter(m => m.type === 'image') || [];
  const videos = product.media?.filter(m => m.type === 'video') || [];
  const allMedia = [...images, ...videos];

  return (
    <div className="pt-[100px] pb-20 max-w-[1440px] mx-auto px-6 md:px-12">
      <button
        onClick={onBack}
        className="mb-12 uppercase-label text-[10px] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={14} /> Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main display */}
          <div className="aspect-[4/5] bg-surface-highest overflow-hidden">
            {selectedMedia ? (
              selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={selectedMedia.url} alt="" className="w-full h-full object-cover" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                <span className="text-6xl">📷</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allMedia.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {allMedia.map((media) => (
                <button
                  key={media.id}
                  onClick={() => setSelectedMedia(media)}
                  className={`aspect-square bg-surface-highest overflow-hidden relative cursor-pointer border-2 transition-colors ${
                    selectedMedia?.id === media.id
                      ? 'border-primary'
                      : 'border-transparent hover:border-surface-high'
                  }`}
                >
                  {media.type === 'video' ? (
                    <>
                      <video src={media.url} className="w-full h-full object-cover opacity-80" />
                      <PlayCircle size={20} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg" />
                    </>
                  ) : (
                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col gap-8 sticky top-[120px]">
          <div>
            <p className="uppercase-label text-on-surface-variant mb-2">{product.brand}</p>
            <h1 className="text-5xl font-light mb-4">{product.kode}</h1>
            <p className="text-3xl">EGP {product.harga.toFixed(2)}</p>
          </div>

          <div className="border-t border-b border-surface-high py-8 grid grid-cols-2 gap-y-6">
            <div className="flex flex-col">
              <span className="uppercase-label text-[10px] text-on-surface-variant mb-1">Kode</span>
              <span className="text-sm">{product.kode}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase-label text-[10px] text-on-surface-variant mb-1">Brand</span>
              <span className="text-sm">{product.brand}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase-label text-[10px] text-on-surface-variant mb-1">Bahan</span>
              <span className="text-sm">{product.bahan}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase-label text-[10px] text-on-surface-variant mb-1">Warna</span>
              <span className="text-sm">{product.warna}</span>
            </div>
          </div>

          <div className="space-y-4">
            <span className="uppercase-label text-[10px] text-on-surface-variant">Ukuran</span>
            <div className="flex gap-3 flex-wrap">
              {product.ukuran.map((size) => (
                <span
                  key={size}
                  className="w-12 h-12 border border-primary flex items-center justify-center text-sm"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          {/* Media count */}
          <div className="text-xs text-on-surface-variant">
            {images.length} photo{images.length !== 1 ? 's' : ''}
            {videos.length > 0 && ` · ${videos.length} video${videos.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>
    </div>
  );
};
