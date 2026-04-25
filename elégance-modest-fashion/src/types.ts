/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
}

export interface Product {
  id: string;
  kode: string;
  brand: string;
  bahan: string;
  ukuran: string[];
  warna: string;
  harga: number;
  created_at: string;
  media: Media[];
}

export type View = 'storefront' | 'login' | 'admin' | 'detail';
