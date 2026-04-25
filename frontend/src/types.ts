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
  kode: string | null;
  brand: string | null;
  bahan: string | null;
  ukuran: string[] | null;
  warna: string | null;
  harga: number | null;
  created_at: string;
  media: Media[] | null;
}

export type View = 'storefront' | 'login' | 'admin' | 'detail';
