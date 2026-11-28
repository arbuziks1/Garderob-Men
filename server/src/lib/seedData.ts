// Ported 1:1 from the frontend's src/data/seedData.ts (products p1-p16, settings, promo
// codes) so a fresh VPS database isn't empty on first boot. SEED_ORDERS is deliberately
// NOT ported — see prisma/seed.ts for why.

import type { SizeFit } from '@prisma/client';

function unsplash(id: string, w = 900): string {
  return `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;
}

const IMG = {
  leatherJacketModel: unsplash('photo-1521223890158-f9f7c3d5d504'),
  leatherJacketProduct: unsplash('photo-1551028719-00167b16eac5'),
  denimJacketProduct: unsplash('photo-1611312449408-fcece27cdbb7'),
  denimJacketModel: unsplash('photo-1516257984-b1b4d707412e'),
  bomberProduct: unsplash('photo-1591047139829-d91aecb6caea'),
  quiltedJacketModel: unsplash('photo-1548126032-079a0fb0099d'),
  hoodieGreyModel: unsplash('photo-1556821840-3a63f95609a7'),
  sweatshirtWhiteProduct: unsplash('photo-1620799140408-edc6dcb6d633'),
  graphicTeeModel: unsplash('photo-1503341504253-dff4815485f1'),
  pinkSweatshirtModel: unsplash('photo-1516826957135-700dedea698c'),
  jeansRackProduct: unsplash('photo-1576995853123-5a10305d93c0'),
  chinosModel: unsplash('photo-1473966968600-fa801b869a1a'),
  outfitFlatlay: unsplash('photo-1593030761757-71fae45fa0e7'),
  checkSuitModel: unsplash('photo-1594938298603-c8148c4dae35'),
  navySuitModel: unsplash('photo-1617137968427-85924c800a22'),
  shirtsFolded: unsplash('photo-1602810318383-e386cc2a3ccf'),
  sneakerDark: unsplash('photo-1491553895911-0055eca6402d'),
  sneakerTan: unsplash('photo-1549298916-b41d501d3772'),
  sneakerTeal: unsplash('photo-1595341888016-a392ef81b7de'),
  sneakerWhiteOrange: unsplash('photo-1600185365926-3a2ce3cdb9eb'),
  capGrey: unsplash('photo-1521369909029-2afed882baee'),
  bootsFlatlay: unsplash('photo-1614676471928-2ed0ad1061a4'),
  coatWool: unsplash('photo-1539533018447-63fcce2678e3'),
  cardiganKnit: unsplash('photo-1631541909061-71e349d1f203'),
  poloFolded: unsplash('photo-1586363104862-3a5e2ab60d99'),
  shortsDenim: unsplash('photo-1591195853828-11db59a44f6b'),
  beltLeather: unsplash('photo-1624222247344-550fb60583dc'),
  backpackBlack: unsplash('photo-1553062407-98eeb64c6a62'),
  backpackCanvas: unsplash('photo-1577733966973-d680bffd2e80'),
};

interface SeedSizeStock {
  sizeRu?: string;
  sizeEu?: string;
  sizeInt?: string;
  // Stock per demo branch, same length/order as DEFAULT_BRANCHES (index 0 = branch 1,
  // index 1 = branch 2).
  branchStock: number[];
}

interface SeedColor {
  name: string;
  hex: string;
  images: string[];
  sizes: SeedSizeStock[];
}

export interface SeedProduct {
  title: string;
  category: string; // Russian label, matches LABEL_TO_CATEGORY
  fit: string; // Russian label, matches LABEL_TO_FIT
  sizeFit?: SizeFit;
  price: number;
  oldPrice?: number;
  description: string;
  modelNote?: string;
  colors: SeedColor[];
  brand?: string;
  countryOfOrigin?: string;
  season?: string;
  material?: string;
  composition?: string;
  characteristics?: Record<string, string>;
  measurements?: { rows: string[]; values: Record<string, Record<string, number>> };
}

// Standard RU clothing-size ↔ international-letter mapping (RU and EU coincide as plain
// numbers in this market, so a "RU/EU" grid just reuses the same number for both).
const RU_TO_INT: Record<string, string> = {
  '44': 'XS',
  '46': 'S',
  '48': 'M',
  '50': 'L',
  '52': 'XL',
  '54': '2XL',
  '56': '3XL',
  '58': '4XL',
};

/** A size row per RU number given, with EU mirrored and INT derived from the mapping —
 *  demonstrates the "all three grids filled, pick any one on the switcher" case.
 *  Each entry is [ru, branch1Stock, branch2Stock] — stock split across the two demo
 *  branches rather than one flat number (see DEFAULT_BRANCHES). */
function ruGrid(entries: [ru: string, b1: number, b2: number][]): SeedSizeStock[] {
  return entries.map(([ru, b1, b2]) => ({ sizeRu: ru, sizeEu: ru, sizeInt: RU_TO_INT[ru], branchStock: [b1, b2] }));
}

/** Jeans waist sizes — INT-only ("W30"), no RU/EU equivalent on purpose: demonstrates
 *  the "only one grid filled in" case the size switcher has to handle gracefully. */
function waistGrid(entries: [waist: number, b1: number, b2: number][]): SeedSizeStock[] {
  return entries.map(([w, b1, b2]) => ({ sizeInt: `W${w}`, branchStock: [b1, b2] }));
}

/** International letter sizes only (no RU/EU) — the other "single grid filled" case. */
function intGrid(entries: [size: string, b1: number, b2: number][]): SeedSizeStock[] {
  return entries.map(([size, b1, b2]) => ({ sizeInt: size, branchStock: [b1, b2] }));
}

/** EU shoe sizing is the only grid that applies to footwear. */
function shoeGrid(entries: [eu: number, b1: number, b2: number][]): SeedSizeStock[] {
  return entries.map(([eu, b1, b2]) => ({ sizeEu: String(eu), branchStock: [b1, b2] }));
}

function oneSize(b1: number, b2: number): SeedSizeStock[] {
  return [{ sizeInt: 'One Size', branchStock: [b1, b2] }];
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    title: 'Кожаная куртка косуха',
    category: 'Куртки и пуховики',
    fit: 'Slim',
    sizeFit: 'SMALL_FIT',
    price: 89900,
    oldPrice: 109900,
    description:
      'Куртка-косуха из плотной эко-кожи с металлической фурнитурой. Плотная подкладка, прямой силуэт с небольшим зауживанием. Подходит для прохладной погоды как самостоятельный верх или слой под пальто.',
    modelNote: 'На модели размер L, рост 184 см',
    colors: [
      {
        name: 'Чёрный',
        hex: '#16161a',
        images: [IMG.leatherJacketProduct, IMG.leatherJacketModel],
        sizes: ruGrid([
          ['46', 1, 1],
          ['48', 2, 4],
          ['50', 3, 5],
          ['52', 2, 3],
          ['54', 0, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Турция',
    season: 'Демисезон',
    material: 'Эко-кожа (искусственная)',
    composition: '100% эко-кожа, подкладка 100% полиэстер',
    characteristics: {
      Силуэт: 'Прямой',
      Застёжка: 'Молния',
      Капюшон: 'Нет',
      Карманы: '4',
      Утеплитель: 'Без утеплителя',
      'Температурный режим': 'До 0°C',
      Влагозащита: 'Нет',
      Уход: 'Протирать влажной тканью',
    },
    measurements: {
      rows: ['Длина изделия', 'Ширина груди', 'Длина рукава', 'Ширина плеч'],
      values: {
        'Длина изделия': { '46 (S)': 68, '48 (M)': 70, '50 (L)': 72, '52 (XL)': 74, '54 (2XL)': 76 },
        'Ширина груди': { '46 (S)': 52, '48 (M)': 54, '50 (L)': 57, '52 (XL)': 60, '54 (2XL)': 63 },
        'Длина рукава': { '46 (S)': 61, '48 (M)': 62, '50 (L)': 63, '52 (XL)': 64, '54 (2XL)': 65 },
        'Ширина плеч': { '46 (S)': 44, '48 (M)': 45, '50 (L)': 46, '52 (XL)': 47, '54 (2XL)': 48 },
      },
    },
  },
  {
    title: 'Джинсовая куртка классическая',
    category: 'Куртки и пуховики',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 42900,
    description:
      'Плотный деним средней плотности, усиленные швы, нагрудные карманы на кнопках. Универсальная куртка на весну и осень, хорошо сочетается с худи и рубашками.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      {
        name: 'Синий деним',
        hex: '#3e5572',
        images: [IMG.denimJacketProduct, IMG.denimJacketModel],
        sizes: ruGrid([
          ['46', 2, 2],
          ['48', 4, 5],
          ['50', 5, 5],
          ['52', 3, 4],
          ['54', 1, 2],
          ['56', 0, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Демисезон',
    material: 'Деним',
    composition: '100% хлопок (деним)',
    characteristics: {
      Силуэт: 'Прямой',
      Застёжка: 'Кнопки',
      Карманы: '4',
      Утеплитель: 'Без утеплителя',
      'Температурный режим': 'До +5°C',
      Влагозащита: 'Нет',
      Уход: 'Машинная стирка 30°C',
    },
  },
  {
    title: 'Бомбер стёганый',
    category: 'Куртки и пуховики',
    fit: 'Oversize',
    sizeFit: 'BIG_FIT',
    price: 36900,
    oldPrice: 44900,
    description:
      'Лёгкий утеплённый бомбер на молнии с резинкой по низу и манжетам. Оверсайз-крой для свободной посадки поверх худи или свитшота.',
    modelNote: 'На модели размер XL, рост 186 см',
    colors: [
      {
        name: 'Терракотовый',
        hex: '#9c5a35',
        images: [IMG.bomberProduct],
        // Deliberately branch-1-only across the whole color — exercises the
        // "only available at one branch" UI case.
        sizes: ruGrid([
          ['46', 0, 0],
          ['48', 3, 0],
          ['50', 6, 0],
          ['52', 4, 0],
          ['54', 2, 0],
        ]),
      },
      {
        name: 'Чёрный',
        hex: '#141414',
        images: [IMG.quiltedJacketModel],
        sizes: ruGrid([
          ['46', 1, 2],
          ['48', 3, 4],
          ['50', 4, 5],
          ['52', 3, 3],
          ['54', 0, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Китай',
    season: 'Демисезон',
    material: 'Полиэстер',
    composition: 'Верх 100% полиэстер, утеплитель синтепон 100 г/м²',
    characteristics: {
      Силуэт: 'Oversize',
      Застёжка: 'Молния',
      Утеплитель: 'Синтепон',
      Капюшон: 'Нет',
      'Температурный режим': 'До -5°C',
      Влагозащита: 'Водоотталкивающая пропитка',
      Уход: 'Машинная стирка 30°C',
    },
  },
  {
    title: 'Худи оверсайз базовое',
    category: 'Худи и толстовки',
    fit: 'Oversize',
    sizeFit: 'BIG_FIT',
    price: 24900,
    description:
      'Плотный футер трёхнитка с начёсом, капюшон на кулиске, карман-кенгуру. Свободный оверсайз-силуэт, рукав реглан.',
    modelNote: 'На модели размер L, рост 182 см',
    colors: [
      {
        name: 'Серый меланж',
        hex: '#8a8a8f',
        images: [IMG.hoodieGreyModel],
        sizes: intGrid([
          ['S', 2, 3],
          ['M', 5, 5],
          ['L', 7, 5],
          ['XL', 3, 5],
          ['2XL', 1, 3],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Демисезон',
    material: 'Хлопок',
    composition: '80% хлопок, 20% полиэстер',
    characteristics: {
      Силуэт: 'Oversize',
      Капюшон: 'Есть, на кулиске',
      Рукав: 'Реглан',
      'Плотность, г/м²': '320',
      'Тип вязки/полотна': 'Футер 3-нитка с начёсом',
      Горловина: 'С капюшоном',
      Уход: 'Машинная стирка 30°C',
    },
    measurements: {
      rows: ['Длина изделия', 'Ширина груди', 'Длина рукава', 'Ширина плеч'],
      values: {
        'Длина изделия': { S: 70, M: 73, L: 76, XL: 79, '2XL': 82 },
        'Ширина груди': { S: 60, M: 64, L: 68, XL: 72, '2XL': 76 },
        'Длина рукава': { S: 58, M: 60, L: 62, XL: 64, '2XL': 66 },
        'Ширина плеч': { S: 50, M: 52, L: 54, XL: 56, '2XL': 58 },
      },
    },
  },
  {
    title: 'Свитшот базовый',
    category: 'Свитшоты и джемперы',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 22900,
    description:
      'Классический свитшот без капюшона из плотного хлопкового футера. Прямой крой, рибана на манжетах и низе изделия.',
    modelNote: 'На модели размер M, рост 178 см',
    colors: [
      {
        name: 'Белый',
        hex: '#f2f1ec',
        images: [IMG.sweatshirtWhiteProduct],
        sizes: intGrid([
          ['S', 3, 3],
          ['M', 6, 4],
          ['L', 4, 6],
          ['XL', 2, 4],
          // Deliberately branch-2-only — only branch 2 has this size at all.
          ['2XL', 0, 2],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Демисезон',
    material: 'Хлопок',
    composition: '95% хлопок, 5% эластан',
    characteristics: {
      Силуэт: 'Прямой',
      Капюшон: 'Нет',
      Рукав: 'Длинный',
      'Тип вязки/полотна': 'Футер петля (без начёса)',
      Горловина: 'Круглая',
      Уход: 'Машинная стирка 30°C',
    },
  },
  {
    title: 'Свитшот оверсайз с принтом',
    category: 'Свитшоты и джемперы',
    fit: 'Oversize',
    sizeFit: 'BIG_FIT',
    price: 19900,
    oldPrice: 26900,
    description:
      'Оверсайз-свитшот плотностью 320 г/м² с графичным принтом. Свободная посадка, двойная строчка по горловине.',
    modelNote: 'На модели размер L, рост 183 см',
    colors: [
      {
        name: 'Чёрный с принтом',
        hex: '#161616',
        images: [IMG.graphicTeeModel],
        sizes: intGrid([
          ['S', 2, 2],
          ['M', 3, 5],
          ['L', 5, 4],
          ['XL', 2, 3],
          ['2XL', 1, 1],
        ]),
      },
      {
        name: 'Розовый пудровый',
        hex: '#d99a86',
        images: [IMG.pinkSweatshirtModel],
        // Deliberately branch-2-only across the whole color — exercises the
        // "only available at one branch" UI case for a second product.
        sizes: intGrid([
          ['S', 0, 2],
          ['M', 0, 4],
          ['L', 0, 4],
          ['XL', 0, 2],
          ['2XL', 0, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Китай',
    season: 'Демисезон',
    material: 'Хлопок',
    composition: '80% хлопок, 20% полиэстер',
    characteristics: {
      Силуэт: 'Oversize',
      'Плотность, г/м²': '320',
      Капюшон: 'Нет',
      'Тип вязки/полотна': 'Футер 3-нитка с начёсом',
      Горловина: 'Круглая',
      Уход: 'Машинная стирка 30°C',
    },
  },
  {
    title: 'Джинсы зауженные',
    category: 'Джинсы',
    fit: 'Slim',
    sizeFit: 'SMALL_FIT',
    price: 27900,
    description: 'Зауженные джинсы из плотного стрейч-денима. Средняя посадка, лёгкие потёртости, пять карманов.',
    modelNote: 'На модели размер 32, соответствует M',
    colors: [
      {
        name: 'Синий',
        hex: '#35526b',
        images: [IMG.jeansRackProduct],
        sizes: waistGrid([
          [28, 1, 2],
          [30, 4, 4],
          [32, 5, 4],
          [34, 2, 3],
          [36, 0, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Круглогодичный',
    material: 'Деним',
    composition: '98% хлопок, 2% эластан',
    characteristics: {
      'Посадка на талии': 'Средняя',
      'Крой штанины': 'Зауженные',
      'Плотность денима': 'Средний (9-13 oz)',
      'Тип застёжки': 'Молния и пуговица',
      Уход: 'Машинная стирка 30°C наизнанку',
    },
    measurements: {
      rows: ['Полуобхват талии', 'Полуобхват бёдер', 'Длина по внешнему шву', 'Шаговый шов'],
      values: {
        'Полуобхват талии': { W28: 36, W30: 38, W32: 40, W34: 42, W36: 44 },
        'Полуобхват бёдер': { W28: 46, W30: 48, W32: 50, W34: 52, W36: 54 },
        'Длина по внешнему шву': { W28: 102, W30: 103, W32: 104, W34: 105, W36: 106 },
        'Шаговый шов': { W28: 76, W30: 77, W32: 78, W34: 79, W36: 80 },
      },
    },
  },
  {
    title: 'Чиносы Slim',
    category: 'Брюки',
    fit: 'Slim',
    sizeFit: 'TRUE_TO_SIZE',
    price: 25900,
    description: 'Хлопковые чиносы зауженного кроя. Эластичный пояс, скрытые карманы, низ зафиксирован манжетой.',
    modelNote: 'На модели размер M, рост 179 см',
    colors: [
      {
        name: 'Хаки',
        hex: '#9c8558',
        images: [IMG.chinosModel],
        sizes: ruGrid([
          ['46', 2, 3],
          ['48', 4, 5],
          ['50', 6, 4],
          ['52', 3, 3],
          // Deliberately branch-1-only for this one row.
          ['54', 3, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Круглогодичный',
    material: 'Хлопок',
    composition: '97% хлопок, 3% эластан',
    characteristics: {
      'Посадка на талии': 'Средняя',
      'Крой штанины': 'Зауженные',
      Пояс: 'Эластичный',
      'Тип застёжки': 'Пуговица',
      Уход: 'Машинная стирка 30°C',
    },
  },
  {
    title: 'Джинсы прямого кроя',
    category: 'Джинсы',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 29900,
    description: 'Джинсы прямого силуэта из плотного денима без эластана. Классическая посадка на талии, пять карманов.',
    modelNote: 'На модели размер M, рост 181 см',
    colors: [
      {
        name: 'Тёмно-синий',
        hex: '#24344a',
        images: [IMG.outfitFlatlay],
        sizes: waistGrid([
          // Deliberately branch-2-only for this one row.
          [30, 0, 2],
          [32, 3, 3],
          [34, 4, 3],
          [36, 2, 2],
          [38, 1, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Круглогодичный',
    material: 'Деним',
    composition: '100% хлопок (деним)',
    characteristics: {
      'Посадка на талии': 'Средняя',
      'Крой штанины': 'Прямые',
      'Плотность денима': 'Плотный (13+ oz)',
      'Тип застёжки': 'Молния',
      Уход: 'Машинная стирка 30°C наизнанку',
    },
  },
  {
    title: 'Костюм-тройка в клетку',
    category: 'Пиджаки и костюмы',
    fit: 'Slim',
    sizeFit: 'SMALL_FIT',
    price: 149900,
    oldPrice: 179900,
    description:
      'Костюм-тройка из шерстяной смеси в клетку: пиджак, жилет и брюки. Приталенный силуэт, подкладка из вискозы.',
    modelNote: 'На модели размер L, рост 185 см',
    colors: [
      {
        name: 'Синяя клетка',
        hex: '#3b4a63',
        images: [IMG.checkSuitModel],
        sizes: ruGrid([
          ['46', 0, 0],
          ['48', 1, 1],
          ['50', 2, 1],
          ['52', 1, 1],
          ['54', 0, 1],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Турция',
    season: 'Демисезон',
    material: 'Шерсть',
    composition: '70% шерсть, 30% полиэстер, подкладка 100% вискоза',
    characteristics: {
      Модель: 'Приталенная',
      'Тип изделия': 'Пиджак, жилет, брюки',
      Застёжка: 'На пуговицы',
      Узор: 'Клетка',
      Крой: 'Slim Fit',
      'Количество пуговиц': '2 пуговицы',
      Шлица: 'Две шлицы',
      Подкладка: 'Полная подкладка',
      Уход: 'Химчистка',
    },
  },
  {
    title: 'Костюм классический',
    category: 'Пиджаки и костюмы',
    fit: 'Slim',
    sizeFit: 'SMALL_FIT',
    price: 134900,
    description: 'Строгий классический костюм из смесовой шерсти. Приталенный крой, однобортный пиджак на две пуговицы.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      {
        name: 'Тёмно-синий',
        hex: '#1f2a44',
        images: [IMG.navySuitModel],
        sizes: ruGrid([
          ['46', 1, 0],
          ['48', 2, 2],
          ['50', 3, 2],
          ['52', 1, 2],
          ['54', 0, 1],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Турция',
    season: 'Круглогодичный',
    material: 'Шерсть',
    composition: '80% шерсть, 20% полиэстер',
    characteristics: {
      Модель: 'Приталенная',
      'Тип изделия': 'Пиджак, брюки',
      Застёжка: 'На пуговицы, однобортный',
      Крой: 'Slim Fit',
      'Количество пуговиц': '2 пуговицы',
      Шлица: 'Одна шлица',
      Подкладка: 'Частичная подкладка',
      Уход: 'Химчистка',
    },
  },
  {
    title: 'Рубашка классическая',
    category: 'Рубашки',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 18900,
    description:
      'Рубашка из хлопковой ткани с лёгким эффектом твила. Классический воротник, приталенный силуэт, не требует глажки.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      {
        name: 'Серый',
        hex: '#6b6f76',
        images: [IMG.shirtsFolded],
        sizes: ruGrid([
          ['46', 2, 3],
          ['48', 5, 5],
          ['50', 6, 5],
          ['52', 3, 4],
          ['54', 1, 2],
        ]),
      },
      {
        name: 'Бордовый',
        hex: '#5b2430',
        images: [IMG.shirtsFolded],
        sizes: ruGrid([
          ['46', 1, 2],
          ['48', 4, 3],
          ['50', 4, 4],
          ['52', 2, 2],
          ['54', 1, 1],
        ]),
      },
      {
        name: 'Белый',
        hex: '#efece4',
        images: [IMG.shirtsFolded],
        sizes: ruGrid([
          ['46', 3, 3],
          ['48', 7, 5],
          ['50', 5, 7],
          ['52', 4, 4],
          ['54', 2, 2],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Турция',
    season: 'Круглогодичный',
    material: 'Хлопок',
    composition: '97% хлопок, 3% эластан',
    characteristics: {
      Модель: 'Приталенная',
      'Тип воротника': 'Классический',
      'Тип рукава': 'Длинный',
      Узор: 'Однотонная',
      'Плотность ткани, г/м²': '120-150',
      Уход: 'Машинная стирка 40°C, не отбеливать',
    },
  },
  {
    title: 'Кроссовки повседневные',
    category: 'Обувь',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 54900,
    description: 'Кроссовки из комбинированных материалов на амортизирующей подошве. Подходят для ежедневной носки.',
    colors: [
      {
        name: 'Чёрный',
        hex: '#202020',
        images: [IMG.sneakerDark],
        sizes: shoeGrid([
          [40, 0, 0],
          [41, 1, 1],
          [42, 2, 2],
          // Deliberately branch-1-only for this one row.
          [43, 3, 0],
          [44, 0, 0],
        ]),
      },
      {
        name: 'Бежевый',
        hex: '#c8a06c',
        images: [IMG.sneakerTan],
        sizes: shoeGrid([
          [40, 0, 1],
          [41, 2, 1],
          [42, 3, 2],
          [43, 1, 1],
          [44, 1, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Китай',
    season: 'Демисезон',
    material: 'Текстиль',
    characteristics: {
      'Материал верха': 'Текстиль, комбинированный',
      'Материал подошвы': 'ЭВА',
      Застёжка: 'Шнурки',
      'Высота подошвы': 'Средняя (2-4 см)',
      Уход: 'Протирать влажной тканью',
    },
  },
  {
    title: 'Кепка бейсболка',
    category: 'Головные уборы и шарфы',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 9900,
    description: 'Бейсболка из плотного хлопка с вышитым логотипом и регулировкой по размеру.',
    colors: [
      {
        name: 'Серый',
        hex: '#55565c',
        images: [IMG.capGrey],
        sizes: oneSize(3, 5),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Китай',
    season: 'Весна-Лето',
    material: 'Хлопок',
    composition: '100% хлопок',
    characteristics: {
      Застёжка: 'Регулируемая, на липучке',
      Уход: 'Ручная стирка',
    },
  },
  {
    title: 'Ботинки замшевые Челси',
    category: 'Обувь',
    fit: 'Regular',
    sizeFit: 'SMALL_FIT',
    price: 47900,
    description: 'Ботинки Челси из натуральной замши на резинках, прошитая подошва.',
    colors: [
      {
        name: 'Коричневый',
        hex: '#5a3b25',
        images: [IMG.bootsFlatlay],
        sizes: shoeGrid([
          [40, 1, 1],
          [41, 2, 2],
          [42, 2, 2],
          // Deliberately branch-2-only for this one row.
          [43, 0, 3],
          [44, 0, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Турция',
    season: 'Демисезон',
    material: 'Замша',
    characteristics: {
      'Материал верха': 'Натуральная замша',
      'Материал подошвы': 'Резина, прошитая',
      Застёжка: 'Резинки по бокам',
      'Высота подошвы': 'Низкая (до 2 см)',
      Уход: 'Чистить щёткой для замши',
    },
  },
  {
    title: 'Кроссовки street',
    category: 'Обувь',
    fit: 'Oversize',
    sizeFit: 'BIG_FIT',
    price: 44900,
    description: 'Массивные кроссовки в стиле street wear на высокой подошве, комбинация текстиля и замши.',
    colors: [
      {
        name: 'Бирюзовый',
        hex: '#1f6f6f',
        images: [IMG.sneakerTeal],
        sizes: shoeGrid([
          [40, 1, 2],
          [41, 3, 2],
          [42, 3, 3],
          [43, 1, 2],
          [44, 0, 1],
        ]),
      },
      {
        name: 'Белый',
        hex: '#e8e3da',
        images: [IMG.sneakerWhiteOrange],
        sizes: shoeGrid([
          [40, 1, 1],
          [41, 2, 2],
          [42, 3, 2],
          [43, 1, 1],
          [44, 0, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Китай',
    season: 'Демисезон',
    material: 'Текстиль',
    characteristics: {
      'Материал верха': 'Текстиль, замша',
      'Материал подошвы': 'ЭВА, амортизирующая',
      Застёжка: 'Шнурки',
      'Высота подошвы': 'Высокая (4+ см)',
      Уход: 'Протирать влажной тканью',
    },
  },
  {
    title: 'Пальто шерстяное классическое',
    category: 'Пальто и плащи',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 94900,
    oldPrice: 119900,
    description:
      'Классическое пальто из шерстяной смеси прямого силуэта. Однобортная застёжка на пуговицах, подкладка из вискозы, боковые карманы с клапаном. Хорошо держит форму и подходит на межсезонье поверх костюма или свитера.',
    modelNote: 'На модели размер L, рост 185 см',
    colors: [
      {
        name: 'Верблюжий',
        hex: '#b08b5a',
        images: [IMG.coatWool],
        sizes: ruGrid([
          ['46', 1, 1],
          ['48', 2, 3],
          ['50', 3, 2],
          ['52', 1, 2],
          ['54', 0, 1],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Турция',
    season: 'Демисезон',
    material: 'Шерсть',
    composition: '70% шерсть, 30% полиэстер, подкладка 100% вискоза',
    characteristics: {
      Силуэт: 'Прямой',
      Застёжка: 'Однобортная, на пуговицах',
      Подкладка: 'Полная подкладка',
      Длина: 'Среднее (ниже колена)',
      Карманы: '2, с клапаном',
      Уход: 'Химчистка',
    },
  },
  {
    title: 'Кардиган вязаный на пуговицах',
    category: 'Свитеры и кардиганы',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 32900,
    description:
      'Вязаный кардиган из плотной пряжи с застёжкой на пуговицы и накладными карманами. Классическая крупная вязка, хорошо сочетается с рубашкой или футболкой.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      {
        name: 'Бежевый',
        hex: '#cdbfa0',
        images: [IMG.cardiganKnit],
        sizes: ruGrid([
          ['46', 1, 2],
          ['48', 3, 4],
          ['50', 4, 3],
          ['52', 2, 2],
          ['54', 0, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Демисезон',
    material: 'Акрил',
    composition: '60% акрил, 40% шерсть',
    characteristics: {
      Силуэт: 'Прямой',
      Застёжка: 'Пуговицы',
      Воротник: 'V-образный вырез',
      'Тип вязки/полотна': 'Крупная вязка',
      Карманы: '2, накладные',
      Уход: 'Ручная стирка 30°C',
    },
  },
  {
    title: 'Поло пике классическое',
    category: 'Футболки и поло',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 16900,
    description:
      'Поло из хлопкового пике с воротником на пуговицах. Плотное полотно держит форму, подходит и для офиса, и для повседневной носки.',
    modelNote: 'На модели размер M, рост 179 см',
    colors: [
      {
        name: 'Мятный',
        hex: '#4f8f82',
        images: [IMG.poloFolded],
        sizes: intGrid([
          ['S', 2, 3],
          ['M', 5, 4],
          ['L', 4, 5],
          ['XL', 2, 2],
          ['2XL', 0, 1],
        ]),
      },
      {
        name: 'Коралловый',
        hex: '#e07856',
        images: [IMG.poloFolded],
        sizes: intGrid([
          ['S', 1, 2],
          ['M', 3, 3],
          ['L', 3, 2],
          ['XL', 1, 1],
          ['2XL', 0, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Весна-Лето',
    material: 'Хлопок',
    composition: '95% хлопок, 5% эластан',
    characteristics: {
      Силуэт: 'Прямой',
      Воротник: 'На пуговицах',
      Рукав: 'Короткий',
      'Тип вязки/полотна': 'Пике',
      Узор: 'Однотонная',
      Уход: 'Машинная стирка 30°C',
    },
  },
  {
    title: 'Шорты джинсовые',
    category: 'Шорты',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 15900,
    description:
      'Джинсовые шорты средней длины из плотного денима. Пять карманов, лёгкие потёртости, не требуют глажки.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      {
        name: 'Голубой',
        hex: '#6f93b5',
        images: [IMG.shortsDenim],
        sizes: ruGrid([
          ['46', 2, 2],
          ['48', 4, 4],
          ['50', 5, 3],
          ['52', 2, 2],
          // Deliberately branch-1-only for this one row.
          ['54', 1, 0],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Весна-Лето',
    material: 'Деним',
    composition: '99% хлопок, 1% эластан',
    characteristics: {
      'Посадка на талии': 'Средняя',
      'Длина шорт': 'Выше колена',
      'Плотность денима': 'Средний (9-13 oz)',
      'Тип застёжки': 'Молния и пуговица',
      Уход: 'Машинная стирка 30°C наизнанку',
    },
  },
  {
    title: 'Ремень кожаный классический',
    category: 'Ремни',
    fit: 'Regular',
    price: 12900,
    description:
      'Ремень из натуральной кожи с классической металлической пряжкой. Прошитые края, подходит под брюки и джинсы.',
    colors: [
      {
        name: 'Коричневый',
        hex: '#6b4327',
        images: [IMG.beltLeather],
        // Belt sizing is a plain cm length, not the RU/INT clothing grid — reuses
        // intGrid's [sizeInt, b1, b2][] signature directly with cm strings.
        sizes: intGrid([
          ['105', 1, 0],
          ['110', 2, 2],
          ['115', 3, 2],
          ['120', 1, 1],
          // Deliberately branch-2-only for this one row.
          ['125', 0, 1],
        ]),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Турция',
    season: 'Круглогодичный',
    material: 'Натуральная кожа',
    composition: '100% натуральная кожа',
    characteristics: {
      Пряжка: 'Металлическая, классическая',
      Ширина: '3.5 см',
      Узор: 'Гладкая',
      Уход: 'Протирать сухой тканью',
    },
  },
  {
    title: 'Рюкзак городской',
    category: 'Сумки и рюкзаки',
    fit: 'Regular',
    price: 24900,
    oldPrice: 29900,
    description:
      'Городской рюкзак из плотной водоотталкивающей ткани с отделением под ноутбук 15". Регулируемые лямки, укреплённое дно, внешний карман на молнии.',
    colors: [
      {
        name: 'Чёрный',
        hex: '#1c1c1c',
        images: [IMG.backpackBlack],
        // Deliberately branch-1-only across the whole color — exercises the
        // "only available at one branch" UI case for bags too.
        sizes: oneSize(4, 0),
      },
      {
        name: 'Хаки (вощёная парусина)',
        hex: '#4a4f3a',
        images: [IMG.backpackCanvas],
        sizes: oneSize(2, 3),
      },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Китай',
    season: 'Круглогодичный',
    material: 'Полиэстер',
    composition: 'Верх 100% полиэстер; цвет хаки — вощёная парусина (хлопок с пропиткой)',
    characteristics: {
      'Отделение для ноутбука': 'До 15"',
      Карманы: '3, включая внешний на молнии',
      Застёжка: 'Молния',
      Влагозащита: 'Водоотталкивающая пропитка',
      Уход: 'Протирать влажной тканью',
    },
  },
];

export const DEFAULT_STORE_SETTINGS = {
  storeName: 'GARDEROB MEN',
  whatsappPhone: '+77012345678',
  phoneDisplay: '+7 (701) 234-56-78',
  kaspiPayLink: '',
  legalName: '',
  businessId: '',
  instagramUrl: 'https://www.instagram.com/garderob.men',
  heroTitle: 'GARDEROB MEN',
  heroSubtitle: 'Мужской гардероб для города. Новая коллекция — верхняя одежда, трикотаж и обувь.',
  heroImage: IMG.quiltedJacketModel,
  heroCtaLabel: 'Смотреть каталог',
};

export const DEFAULT_PROMO_CODES = [
  { code: 'GARDEROB10', discountPercent: 10, active: true },
  { code: 'WELCOME15', discountPercent: 15, active: true },
];

// The store's two physical pickup shops — same "demo placeholder, update in Settings"
// convention as the old single-address DEFAULT_STORE_SETTINGS.address used to follow.
export const DEFAULT_BRANCHES = [
  {
    name: 'Магазин на Протозанова',
    address: 'г. Усть-Каменогорск, ул. Протозанова, 123 (демо-адрес — обновите в Настройках)',
    workingHours: [
      { days: 'Пн–Сб', hours: '10:00–20:00' },
      { days: 'Вс', hours: '11:00–18:00' },
    ],
    phone: '+7 (701) 234-56-78',
    twoGisUrl: 'https://go.2gis.com/ev4n5',
    mapLat: null as number | null,
    mapLng: null as number | null,
  },
  {
    name: 'Магазин в ТРЦ (демо — обновите в Настройках)',
    address: 'г. Усть-Каменогорск, пр. Независимости, 45, ТРЦ «Аман» (демо-адрес — обновите в Настройках)',
    workingHours: [{ days: 'Пн–Вс', hours: '10:00–21:00' }],
    phone: '+7 (701) 234-56-79',
    twoGisUrl: '',
    mapLat: null as number | null,
    mapLng: null as number | null,
  },
];
