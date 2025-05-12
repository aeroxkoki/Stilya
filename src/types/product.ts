export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  description?: string;
  tags: string[];
  category?: string;
  affiliateUrl: string;
  source?: string;
  createdAt?: string;
}

export interface SwipeResult {
  productId: string;
  result: 'yes' | 'no';
  userId: string;
}

export interface ProductsState {
  products: Product[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
}

export interface FavoriteProduct {
  id: string;
  userId: string;
  productId: string;
  createdAt?: string;
}
