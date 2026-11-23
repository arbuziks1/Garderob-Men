import type { Category } from '../types';

/** Default measurement rows offered per category — deliberately just the 3-4 basics
 *  that actually help a buyer pick a size, not every possible tailoring parameter.
 *  Admin can rename, remove, or add their own rows on top of these in the form. */
export const CATEGORY_MEASUREMENT_ROWS: Record<Category, string[]> = {
  'Верхняя одежда': ['Длина изделия', 'Ширина груди', 'Длина рукава', 'Ширина плеч'],
  'Худи и свитшоты': ['Длина изделия', 'Ширина груди', 'Длина рукава', 'Ширина плеч'],
  'Костюмы и рубашки': ['Длина изделия', 'Ширина груди', 'Длина рукава', 'Ширина плеч'],
  'Брюки и джинсы': ['Полуобхват талии', 'Полуобхват бёдер', 'Длина по внешнему шву', 'Шаговый шов'],
  'Обувь и аксессуары': [],
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
};

export function shortMeasurementLabel(rowLabel: string): string {
  return SHORT_MEASUREMENT_LABEL[rowLabel] ?? rowLabel.toLowerCase();
}
