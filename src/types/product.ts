export type Category =
  | 'Верхняя одежда'
  | 'Худи и свитшоты'
  | 'Брюки и джинсы'
  | 'Костюмы и рубашки'
  | 'Обувь и аксессуары';

export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type Fit = 'Oversize' | 'Regular' | 'Slim';

export const SIZES: Size[] = ['S', 'M', 'L', 'XL', 'XXL'];
export const FITS: Fit[] = ['Oversize', 'Regular', 'Slim'];
export const CATEGORIES: Category[] = [
  'Верхняя одежда',
  'Худи и свитшоты',
  'Брюки и джинсы',
  'Костюмы и рубашки',
  'Обувь и аксессуары',
];

export interface StockBySize {
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  images: string[];
  stock: StockBySize;
}

export interface Product {
  id: string;
  title: string;
  category: Category;
  fit: Fit;
  price: number;
  oldPrice?: number;
  description: string;
  modelNote?: string;
  colors: ColorVariant[];
  createdAt: string;
  brand?: string;
  countryOfOrigin?: string;
  season?: string;
  material?: string;
  composition?: string;
  characteristics?: Record<string, string>;
}

export function totalStock(product: Product): number {
  return product.colors.reduce(
    (sum, color) =>
      sum + Object.values(color.stock).reduce((s, n) => s + n, 0),
    0
  );
}

export function isInStock(product: Product): boolean {
  return totalStock(product) > 0;
}

export function priceRange(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 0];
  const prices = products.map((p) => p.price);
  return [Math.min(...prices), Math.max(...prices)];
}
