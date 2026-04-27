export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
}

export type Kategori =
  | 'Outer Abaya'
  | 'Instant Abaya'
  | 'Luxe Kaftan'
  | 'Luxe Chiffon'
  | 'Velvet Abaya';

export type Ukuran = 'L' | 'XL' | '2XL' | '3XL' | '4XL' | 'Free Size';

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

export interface Product {
  id: string;
  kode: string | null;
  nama: string | null;
  brand: string | null;
  bahan: string | null;
  ukuran: Ukuran[] | null;
  warna: string | null;
  harga: number | null;
  kategori: Kategori | null;
  deskripsi: string | null;
  isTrending: boolean;
  isSale: boolean;
  isHeroFeatured: boolean;
  isVisible: boolean;
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
