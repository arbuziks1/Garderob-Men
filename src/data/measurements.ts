import type { Category } from '../types';

/** Default measurement rows offered per category — deliberately just the 3-4 basics
 *  that actually help a buyer pick a size, not every possible tailoring parameter.
 *  Admin can rename, remove, or add their own rows on top of these in the form. */
const TOP_ROWS = ['Длина изделия', 'Ширина груди', 'Длина рукава', 'Ширина плеч'];
const BOTTOM_ROWS = ['Полуобхват талии', 'Полуобхват бёдер', 'Длина по внешнему шву', 'Шаговый шов'];

export const CATEGORY_MEASUREMENT_ROWS: Record<Category, string[]> = {
  'Куртки и пуховики': TOP_ROWS,
  'Пальто и плащи': TOP_ROWS,
  'Пиджаки и костюмы': TOP_ROWS,
  'Худи и толстовки': TOP_ROWS,
  'Свитшоты и джемперы': TOP_ROWS,
  'Свитеры и кардиганы': TOP_ROWS,
  'Рубашки': TOP_ROWS,
  'Футболки и поло': TOP_ROWS,
  'Брюки': BOTTOM_ROWS,
  'Джинсы': BOTTOM_ROWS,
  'Шорты': BOTTOM_ROWS,
  'Обувь': ['Длина стельки', 'Ширина колодки'],
  'Ремни': ['Длина ремня', 'Ширина ремня'],
  'Сумки и рюкзаки': ['Высота', 'Ширина', 'Глубина'],
  'Головные уборы и шарфы': [],
};

/** Short word used in the one-line summary under the size buttons on the product page
 *  ("48 (M): длина 70 см · грудь 54 см …") — falls back to the full row label in
 *  lowercase for any custom row an admin added by hand. */
const SHORT_MEASUREMENT_LABEL: Record<string, string> = {
  'Длина изделия': 'длина',
  'Ширина груди': 'грудь',
  'Длина рукава': 'рукав',
  'Ширина плеч': 'плечи',
  'Полуобхват талии': 'талия',
  'Полуобхват бёдер': 'бёдра',
  'Длина по внешнему шву': 'шов',
  'Шаговый шов': 'шаг',
  'Длина стельки': 'стелька',
  'Ширина колодки': 'колодка',
  'Длина ремня': 'длина',
  'Ширина ремня': 'ширина',
  Высота: 'высота',
  Ширина: 'ширина',
  Глубина: 'глубина',
};

export function shortMeasurementLabel(rowLabel: string): string {
  return SHORT_MEASUREMENT_LABEL[rowLabel] ?? rowLabel.toLowerCase();
}
