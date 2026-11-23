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
};

interface SeedSizeStock {
  sizeRu?: string;
  sizeEu?: string;
  sizeInt?: string;
  stock: number;
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
 *  demonstrates the "all three grids filled, pick any one on the switcher" case. */
function ruGrid(entries: [ru: string, stock: number][]): SeedSizeStock[] {
  return entries.map(([ru, stockQty]) => ({ sizeRu: ru, sizeEu: ru, sizeInt: RU_TO_INT[ru], stock: stockQty }));
}

/** Jeans waist sizes — INT-only ("W30"), no RU/EU equivalent on purpose: demonstrates
 *  the "only one grid filled in" case the size switcher has to handle gracefully. */
function waistGrid(entries: [waist: number, stock: number][]): SeedSizeStock[] {
  return entries.map(([w, stockQty]) => ({ sizeInt: `W${w}`, stock: stockQty }));
}

/** International letter sizes only (no RU/EU) — the other "single grid filled" case. */
function intGrid(entries: [size: string, stock: number][]): SeedSizeStock[] {
  return entries.map(([size, stockQty]) => ({ sizeInt: size, stock: stockQty }));
}

/** EU shoe sizing is the only grid that applies to footwear. */
function shoeGrid(entries: [eu: number, stock: number][]): SeedSizeStock[] {
  return entries.map(([eu, stockQty]) => ({ sizeEu: String(eu), stock: stockQty }));
}

function oneSize(stockQty: number): SeedSizeStock[] {
  return [{ sizeInt: 'One Size', stock: stockQty }];
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    title: 'Кожаная куртка косуха',
    category: 'Верхняя одежда',
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
          ['46', 2],
          ['48', 6],
          ['50', 8],
          ['52', 5],
          ['54', 0],
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
  },
  {
    title: 'Джинсовая куртка классическая',
    category: 'Верхняя одежда',
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
          ['46', 4],
          ['48', 9],
          ['50', 10],
          ['52', 7],
          ['54', 3],
          ['56', 0],
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
    category: 'Верхняя одежда',
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
        sizes: ruGrid([
          ['46', 0],
          ['48', 3],
          ['50', 6],
          ['52', 4],
          ['54', 2],
        ]),
      },
      {
        name: 'Чёрный',
        hex: '#141414',
        images: [IMG.quiltedJacketModel],
        sizes: ruGrid([
          ['46', 3],
          ['48', 7],
          ['50', 9],
          ['52', 6],
          ['54', 0],
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
    category: 'Худи и свитшоты',
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
          ['S', 5],
          ['M', 10],
          ['L', 12],
          ['XL', 8],
          ['2XL', 4],
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
  },
  {
    title: 'Свитшот базовый',
    category: 'Худи и свитшоты',
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
          ['S', 6],
          ['M', 10],
          ['L', 10],
          ['XL', 6],
          ['2XL', 2],
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
    category: 'Худи и свитшоты',
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
          ['S', 4],
          ['M', 8],
          ['L', 9],
          ['XL', 5],
          ['2XL', 2],
        ]),
      },
      {
        name: 'Розовый пудровый',
        hex: '#d99a86',
        images: [IMG.pinkSweatshirtModel],
        sizes: intGrid([
          ['S', 2],
          ['M', 4],
          ['L', 4],
          ['XL', 2],
          ['2XL', 0],
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
    category: 'Брюки и джинсы',
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
          [28, 3],
          [30, 8],
          [32, 9],
          [34, 5],
          [36, 0],
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
  },
  {
    title: 'Чиносы Slim',
    category: 'Брюки и джинсы',
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
          ['46', 5],
          ['48', 9],
          ['50', 10],
          ['52', 6],
          ['54', 3],
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
    category: 'Брюки и джинсы',
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
          [30, 2],
          [32, 6],
          [34, 7],
          [36, 4],
          [38, 1],
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
    category: 'Костюмы и рубашки',
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
          ['46', 0],
          ['48', 2],
          ['50', 3],
          ['52', 2],
          ['54', 1],
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
    category: 'Костюмы и рубашки',
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
          ['46', 1],
          ['48', 4],
          ['50', 5],
          ['52', 3],
          ['54', 1],
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
    category: 'Костюмы и рубашки',
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
          ['46', 5],
          ['48', 10],
          ['50', 11],
          ['52', 7],
          ['54', 3],
        ]),
      },
      {
        name: 'Бордовый',
        hex: '#5b2430',
        images: [IMG.shirtsFolded],
        sizes: ruGrid([
          ['46', 3],
          ['48', 7],
          ['50', 8],
          ['52', 4],
          ['54', 2],
        ]),
      },
      {
        name: 'Белый',
        hex: '#efece4',
        images: [IMG.shirtsFolded],
        sizes: ruGrid([
          ['46', 6],
          ['48', 12],
          ['50', 12],
          ['52', 8],
          ['54', 4],
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
    category: 'Обувь и аксессуары',
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
          [40, 0],
          [41, 2],
          [42, 4],
          [43, 3],
          [44, 0],
        ]),
      },
      {
        name: 'Бежевый',
        hex: '#c8a06c',
        images: [IMG.sneakerTan],
        sizes: shoeGrid([
          [40, 1],
          [41, 3],
          [42, 5],
          [43, 2],
          [44, 1],
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
    category: 'Обувь и аксессуары',
    fit: 'Regular',
    sizeFit: 'TRUE_TO_SIZE',
    price: 9900,
    description: 'Бейсболка из плотного хлопка с вышитым логотипом и регулировкой по размеру.',
    colors: [
      {
        name: 'Серый',
        hex: '#55565c',
        images: [IMG.capGrey],
        sizes: oneSize(8),
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
    category: 'Обувь и аксессуары',
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
          [40, 2],
          [41, 4],
          [42, 4],
          [43, 3],
          [44, 0],
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
    category: 'Обувь и аксессуары',
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
          [40, 3],
          [41, 5],
          [42, 6],
          [43, 3],
          [44, 1],
        ]),
      },
      {
        name: 'Белый',
        hex: '#e8e3da',
        images: [IMG.sneakerWhiteOrange],
        sizes: shoeGrid([
          [40, 2],
          [41, 4],
          [42, 5],
          [43, 2],
          [44, 0],
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
];

export const DEFAULT_STORE_SETTINGS = {
  storeName: 'GARDEROB MEN',
  address: 'г. Усть-Каменогорск, ул. Протозанова, 123 (демо-адрес — обновите в Настройках)',
  workingHours: [
    { days: 'Пн–Сб', hours: '10:00–20:00' },
    { days: 'Вс', hours: '11:00–18:00' },
  ],
  whatsappPhone: '+77012345678',
  phoneDisplay: '+7 (701) 234-56-78',
  kaspiPayLink: '',
  legalName: '',
  businessId: '',
  instagramUrl: 'https://www.instagram.com/garderob.men',
  twoGisUrl: 'https://go.2gis.com/ev4n5',
  heroTitle: 'GARDEROB MEN',
  heroSubtitle: 'Мужской гардероб для города. Новая коллекция — верхняя одежда, трикотаж и обувь.',
  heroImage: IMG.quiltedJacketModel,
  heroCtaLabel: 'Смотреть каталог',
};

export const DEFAULT_PROMO_CODES = [
  { code: 'GARDEROB10', discountPercent: 10, active: true },
  { code: 'WELCOME15', discountPercent: 15, active: true },
];
