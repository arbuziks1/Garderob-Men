export type Category =
  | 'Куртки и пуховики'
  | 'Пальто и плащи'
  | 'Пиджаки и костюмы'
  | 'Худи и толстовки'
  | 'Свитшоты и джемперы'
  | 'Свитеры и кардиганы'
  | 'Рубашки'
  | 'Футболки и поло'
  | 'Брюки'
  | 'Джинсы'
  | 'Шорты'
  | 'Обувь'
  | 'Ремни'
  | 'Сумки и рюкзаки'
  | 'Головные уборы и шарфы';

export type Fit = 'До талии' | 'До бедра' | 'Ниже бедра';

export type SizeFit = 'SMALL_FIT' | 'TRUE_TO_SIZE' | 'BIG_FIT';

export const SIZE_FIT_LABEL: Record<SizeFit, string> = {
  SMALL_FIT: 'Маломерит. Берите на размер больше.',
  TRUE_TO_SIZE: 'Идёт размер в размер.',
  BIG_FIT: 'Большемерит. Можно взять размер меньше.',
};

export const SIZE_FITS: SizeFit[] = ['SMALL_FIT', 'TRUE_TO_SIZE', 'BIG_FIT'];

export const FITS: Fit[] = ['До талии', 'До бедра', 'Ниже бедра'];
export const CATEGORIES: Category[] = [
  'Куртки и пуховики',
  'Пальто и плащи',
  'Пиджаки и костюмы',
  'Худи и толстовки',
  'Свитшоты и джемперы',
  'Свитеры и кардиганы',
  'Рубашки',
  'Футболки и поло',
  'Брюки',
  'Джинсы',
  'Шорты',
  'Обувь',
  'Ремни',
  'Сумки и рюкзаки',
  'Головные уборы и шарфы',
];

/** The 3-column grouping used by the header's "Каталог" mega-menu. */
export const CATEGORY_GROUPS: { title: string; categories: Category[] }[] = [
  {
    title: 'Верхняя одежда и костюмы',
    categories: ['Куртки и пуховики', 'Пальто и плащи', 'Пиджаки и костюмы'],
  },
  {
    title: 'Повседневная одежда и низ',
    categories: [
      'Худи и толстовки',
      'Свитшоты и джемперы',
      'Свитеры и кардиганы',
      'Рубашки',
      'Футболки и поло',
      'Брюки',
      'Джинсы',
      'Шорты',
    ],
  },
  {
    title: 'Обувь и аксессуары',
    categories: ['Обувь', 'Ремни', 'Сумки и рюкзаки', 'Головные уборы и шарфы'],
  },
];

export interface BranchStock {
  branchId: string;
  branchName: string;
  stock: number;
}

export interface SizeStock {
  id: string;
  sizeRu?: string;
  sizeEu?: string;
  sizeInt?: string;
  stock: number;
  branchStocks: BranchStock[];
}

/** Замеры в см, keyed by the combined size label (see combinedSizeLabel in
 *  data/sizeGrids.ts) so one table covers a size regardless of which color it's on. */
export interface ProductMeasurements {
  rows: string[];
  values: Record<string, Record<string, number>>; // values[rowLabel][sizeLabel] = cm
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
  measurements?: ProductMeasurements;
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
