export type Category =
  | 'Верхняя одежда'
  | 'Худи и свитшоты'
  | 'Брюки и джинсы'
  | 'Костюмы и рубашки'
  | 'Обувь и аксессуары';

export type Fit = 'Oversize' | 'Regular' | 'Slim';

export type SizeFit = 'SMALL_FIT' | 'TRUE_TO_SIZE' | 'BIG_FIT';

export const SIZE_FIT_LABEL: Record<SizeFit, string> = {
  SMALL_FIT: 'Маломерит (рекомендуем брать на размер больше)',
  TRUE_TO_SIZE: 'Идёт размер в размер (True to size)',
  BIG_FIT: 'Большемерит (свободная посадка, можно на размер меньше)',
};

export const SIZE_FITS: SizeFit[] = ['SMALL_FIT', 'TRUE_TO_SIZE', 'BIG_FIT'];

export const FITS: Fit[] = ['Oversize', 'Regular', 'Slim'];
export const CATEGORIES: Category[] = [
  'Верхняя одежда',
  'Худи и свитшоты',
  'Брюки и джинсы',
  'Костюмы и рубашки',
  'Обувь и аксессуары',
];

export interface SizeStock {
  id: string;
  sizeRu?: string;
  sizeEu?: string;
  sizeInt?: string;
  stock: number;
}

export interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  images: string[];
  sizes: SizeStock[];
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  category: Category;
  fit: Fit;
  sizeFit?: SizeFit;
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
    (sum, color) => sum + color.sizes.reduce((s, row) => s + row.stock, 0),
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
