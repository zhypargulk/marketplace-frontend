/**
 * Product entity types — public API of entities/product slice (FSD).
 */
export interface ProductAttribute {
  key: string;
  value: string;
}

export interface ProductOffer {
  id: string;
  seller_id: string;
  seller_name?: string | null;
  seller_rating?: number | null;
  price_amount: number;
  price_currency: string;
  delivery_date: string | null;
}

export interface ProductDetail {
  id: string;
  name: string;
  image_url: string | null;
  attributes?: ProductAttribute[];
  offers?: ProductOffer[];
}

export interface ProductListItem {
  id: string;
  name: string;
  thumbnail_url: string | null;
  price: number | null;
  stock: number;
  nearest_delivery_date: string | null;
}
