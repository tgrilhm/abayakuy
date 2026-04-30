export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  status: 'ready' | 'processing' | 'failed';
  order: number;
}

export type Kategori =
  | 'Outer Abaya'
  | 'Instant Abaya'
  | 'Luxe Kaftan'
  | 'Luxe Chiffon'
  | 'Velvet Abaya';

export type Ukuran = 'L' | 'XL' | '2XL' | '3XL' | '4XL' | 'Free Size';

export type Bahan =
  | 'Premium Harrer'
  | 'Tiktok'
  | 'Harrer Suudi'
  | 'Kursa'
  | 'Siffon'
  | 'Harrer'
  | 'Velvet Bludru'
  | 'Crepe'
  | 'Satin';

export type Warna =
  | 'Hitam'
  | 'Krem'
  | 'Coffe'
  | 'Mint'
  | 'Biru'
  | 'Abu-abu'
  | 'Merah'
  | 'Coklat'
  | 'Putih'
  | 'Kuning'
  | 'Ungu'
  | 'Hijau'
  | 'Hijau Botol'
  | 'Broken White'
  | 'Emerald';

export const KATEGORI_OPTIONS: Kategori[] = [
  'Outer Abaya',
  'Instant Abaya',
  'Luxe Kaftan',
  'Luxe Chiffon',
  'Velvet Abaya',
];

export const UKURAN_OPTIONS: Ukuran[] = [
  'L', 'XL', '2XL', '3XL', '4XL', 'Free Size',
];

const UKURAN_DISPLAY_MAP: Record<string, Ukuran> = {
  L: 'L',
  XL: 'XL',
  XXL: '2XL',
  XXXL: '3XL',
  XXXXL: '4XL',
  Free_Size: 'Free Size',
};

export function formatUkuranDisplay(size: string): Ukuran | string {
  return UKURAN_DISPLAY_MAP[size] ?? size;
}

export const BAHAN_OPTIONS: Bahan[] = [
  'Premium Harrer',
  'Tiktok',
  'Harrer Suudi',
  'Kursa',
  'Siffon',
  'Harrer',
  'Velvet Bludru',
  'Crepe',
  'Satin',
];

export const WARNA_OPTIONS: Warna[] = [
  'Hitam',
  'Krem',
  'Coffe',
  'Mint',
  'Biru',
  'Abu-abu',
  'Merah',
  'Coklat',
  'Putih',
  'Kuning',
  'Ungu',
  'Hijau',
  'Hijau Botol',
  'Broken White',
  'Emerald',
];

export interface Product {
  id: string;
  kode: string | null;
  nama: string | null;
  brand: string | null;
  link: string | null;
  bahan: Bahan | null;
  ukuran: Ukuran[] | null;
  warna: Warna[] | null;
  harga: number | null;
  kategori: Kategori | null;
  deskripsi: string | null;
  isTrending: boolean;
  isSale: boolean;
  isHeroFeatured: boolean;
  isVisible: boolean;
  isAvailable: boolean;
  created_at: string;
  updated_at: string;
  media: Media[] | null;
}

export interface PaginatedProducts {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type View = 'storefront' | 'login' | 'admin' | 'detail';
