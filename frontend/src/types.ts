export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
}

export interface Product {
  id: string;
  kode: string | null;
  nama: string | null;
  brand: string | null;
  bahan: string | null;
  ukuran: string[] | null;
  warna: string | null;
  harga: number | null;
  kategori: string | null;
  deskripsi: string | null;
  stok: number | null;
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
