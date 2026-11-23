// RU/EU are numerically identical for men's clothing in this store's sizing; INT is the
// letter equivalent. Used only to auto-fill the other two fields in the admin form when
// one is entered — never enforced, admin can always override.
export const RU_EU_TO_INT: Record<string, string> = {
  '44': 'XS',
  '46': 'S',
  '48': 'M',
  '50': 'L',
  '52': 'XL',
  '54': '2XL',
  '56': '3XL',
  '58': '4XL',
};

export const INT_TO_RU_EU: Record<string, string> = Object.fromEntries(
  Object.entries(RU_EU_TO_INT).map(([ruEu, int]) => [int, ruEu])
);

// Order to sort letter sizes sensibly in filter lists.
export const INT_SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

export interface SizeGridPresetRow {
  sizeRu?: string;
  sizeEu?: string;
  sizeInt?: string;
}

export interface SizeGridPreset {
  label: string;
  rows: SizeGridPresetRow[];
}

/** Sorts a list of raw size labels (mix of numeric RU/EU sizes, INT letters, "W.." jeans
 *  waist sizes, "One Size", etc.) into a sensible display order: numbers ascending, then
 *  known letter sizes in XS..5XL order, then anything else alphabetically. */
export function sortSizeLabels(labels: string[]): string[] {
  return [...labels].sort((a, b) => {
    const aNum = Number(a);
    const bNum = Number(b);
    const aIsNum = a.trim() !== '' && !Number.isNaN(aNum);
    const bIsNum = b.trim() !== '' && !Number.isNaN(bNum);
    if (aIsNum && bIsNum) return aNum - bNum;
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    const aIdx = INT_SIZE_ORDER.indexOf(a);
    const bIdx = INT_SIZE_ORDER.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });
}

export const SIZE_GRID_PRESETS: SizeGridPreset[] = [
  {
    label: 'Верх / Костюмы RU 44–58',
    rows: ['44', '46', '48', '50', '52', '54', '56', '58'].map((n) => ({
      sizeRu: n,
      sizeEu: n,
      sizeInt: RU_EU_TO_INT[n],
    })),
  },
  {
    label: 'Международная XS–4XL',
    rows: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map((int) => ({ sizeInt: int })),
  },
  {
    label: 'Джинсы / Брюки W28–W38',
    rows: [28, 30, 32, 34, 36, 38].map((w) => ({ sizeInt: `W${w}` })),
  },
  {
    label: 'Обувь EU 38–46',
    rows: Array.from({ length: 9 }, (_, i) => String(38 + i)).map((n) => ({ sizeEu: n })),
  },
  {
    label: 'Единый размер',
    rows: [{ sizeInt: 'One Size' }],
  },
];
