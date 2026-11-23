// Ported 1:1 from the frontend's src/data/seedData.ts (products p1-p16, settings, promo
// codes) so a fresh VPS database isn't empty on first boot. SEED_ORDERS is deliberately
// NOT ported — see prisma/seed.ts for why.

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

interface SeedStock {
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

interface SeedColor {
  name: string;
  hex: string;
  images: string[];
  stock: SeedStock;
}

export interface SeedProduct {
  title: string;
  category: string; // Russian label, matches LABEL_TO_CATEGORY
  fit: string; // Russian label, matches LABEL_TO_FIT
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

function stock(s: number, m: number, l: number, xl: number, xxl: number): SeedStock {
  return { S: s, M: m, L: l, XL: xl, XXL: xxl };
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    title: 'Кожаная куртка косуха',
    category: 'Верхняя одежда',
    fit: 'Slim',
    price: 89900,
    oldPrice: 109900,
    description:
      'Куртка-косуха из плотной эко-кожи с металлической фурнитурой. Плотная подкладка, прямой силуэт с небольшим зауживанием. Подходит для прохладной погоды как самостоятельный верх или слой под пальто.',
    modelNote: 'На модели размер L, рост 184 см',
    colors: [
      { name: 'Чёрный', hex: '#16161a', images: [IMG.leatherJacketProduct, IMG.leatherJacketModel], stock: stock(2, 6, 8, 5, 0) },
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
    },
  },
  {
    title: 'Джинсовая куртка классическая',
    category: 'Верхняя одежда',
    fit: 'Regular',
    price: 42900,
    description:
      'Плотный деним средней плотности, усиленные швы, нагрудные карманы на кнопках. Универсальная куртка на весну и осень, хорошо сочетается с худи и рубашками.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      { name: 'Синий деним', hex: '#3e5572', images: [IMG.denimJacketProduct, IMG.denimJacketModel], stock: stock(4, 9, 10, 7, 3) },
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
    },
  },
  {
    title: 'Бомбер стёганый',
    category: 'Верхняя одежда',
    fit: 'Oversize',
    price: 36900,
    oldPrice: 44900,
    description:
      'Лёгкий утеплённый бомбер на молнии с резинкой по низу и манжетам. Оверсайз-крой для свободной посадки поверх худи или свитшота.',
    modelNote: 'На модели размер XL, рост 186 см',
    colors: [
      { name: 'Терракотовый', hex: '#9c5a35', images: [IMG.bomberProduct], stock: stock(0, 3, 6, 4, 2) },
      { name: 'Чёрный', hex: '#141414', images: [IMG.quiltedJacketModel], stock: stock(3, 7, 9, 6, 0) },
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
    },
  },
  {
    title: 'Худи оверсайз базовое',
    category: 'Худи и свитшоты',
    fit: 'Oversize',
    price: 24900,
    description:
      'Плотный футер трёхнитка с начёсом, капюшон на кулиске, карман-кенгуру. Свободный оверсайз-силуэт, рукав реглан.',
    modelNote: 'На модели размер L, рост 182 см',
    colors: [{ name: 'Серый меланж', hex: '#8a8a8f', images: [IMG.hoodieGreyModel], stock: stock(5, 10, 12, 8, 4) }],
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
    },
  },
  {
    title: 'Свитшот базовый',
    category: 'Худи и свитшоты',
    fit: 'Regular',
    price: 22900,
    description:
      'Классический свитшот без капюшона из плотного хлопкового футера. Прямой крой, рибана на манжетах и низе изделия.',
    modelNote: 'На модели размер M, рост 178 см',
    colors: [{ name: 'Белый', hex: '#f2f1ec', images: [IMG.sweatshirtWhiteProduct], stock: stock(6, 10, 10, 6, 2) }],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Демисезон',
    material: 'Хлопок',
    composition: '95% хлопок, 5% эластан',
    characteristics: {
      Силуэт: 'Прямой',
      Капюшон: 'Нет',
      Рукав: 'Длинный',
    },
  },
  {
    title: 'Свитшот оверсайз с принтом',
    category: 'Худи и свитшоты',
    fit: 'Oversize',
    price: 19900,
    oldPrice: 26900,
    description:
      'Оверсайз-свитшот плотностью 320 г/м² с графичным принтом. Свободная посадка, двойная строчка по горловине.',
    modelNote: 'На модели размер L, рост 183 см',
    colors: [
      { name: 'Чёрный с принтом', hex: '#161616', images: [IMG.graphicTeeModel], stock: stock(4, 8, 9, 5, 2) },
      { name: 'Розовый пудровый', hex: '#d99a86', images: [IMG.pinkSweatshirtModel], stock: stock(2, 4, 4, 2, 0) },
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
    },
  },
  {
    title: 'Джинсы зауженные',
    category: 'Брюки и джинсы',
    fit: 'Slim',
    price: 27900,
    description: 'Зауженные джинсы из плотного стрейч-денима. Средняя посадка, лёгкие потёртости, пять карманов.',
    modelNote: 'На модели размер 32, соответствует M',
    colors: [{ name: 'Синий', hex: '#35526b', images: [IMG.jeansRackProduct], stock: stock(3, 8, 9, 5, 0) }],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Круглогодичный',
    material: 'Деним',
    composition: '98% хлопок, 2% эластан',
    characteristics: {
      Крой: 'Зауженный',
      Посадка: 'Средняя',
      Застёжка: 'Молния, пуговица',
    },
  },
  {
    title: 'Чиносы Slim',
    category: 'Брюки и джинсы',
    fit: 'Slim',
    price: 25900,
    description: 'Хлопковые чиносы зауженного кроя. Эластичный пояс, скрытые карманы, низ зафиксирован манжетой.',
    modelNote: 'На модели размер M, рост 179 см',
    colors: [{ name: 'Хаки', hex: '#9c8558', images: [IMG.chinosModel], stock: stock(5, 9, 10, 6, 3) }],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Круглогодичный',
    material: 'Хлопок',
    composition: '97% хлопок, 3% эластан',
    characteristics: {
      Крой: 'Зауженный',
      Посадка: 'Средняя',
      Пояс: 'Эластичный',
    },
  },
  {
    title: 'Джинсы прямого кроя',
    category: 'Брюки и джинсы',
    fit: 'Regular',
    price: 29900,
    description: 'Джинсы прямого силуэта из плотного денима без эластана. Классическая посадка на талии, пять карманов.',
    modelNote: 'На модели размер M, рост 181 см',
    colors: [{ name: 'Тёмно-синий', hex: '#24344a', images: [IMG.outfitFlatlay], stock: stock(2, 6, 7, 4, 1) }],
    brand: 'Без бренда',
    countryOfOrigin: 'Узбекистан',
    season: 'Круглогодичный',
    material: 'Деним',
    composition: '100% хлопок (деним)',
    characteristics: {
      Крой: 'Прямой',
      Посадка: 'Средняя',
    },
  },
  {
    title: 'Костюм-тройка в клетку',
    category: 'Костюмы и рубашки',
    fit: 'Slim',
    price: 149900,
    oldPrice: 179900,
    description:
      'Костюм-тройка из шерстяной смеси в клетку: пиджак, жилет и брюки. Приталенный силуэт, подкладка из вискозы.',
    modelNote: 'На модели размер L, рост 185 см',
    colors: [{ name: 'Синяя клетка', hex: '#3b4a63', images: [IMG.checkSuitModel], stock: stock(0, 2, 3, 2, 1) }],
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
    },
  },
  {
    title: 'Костюм классический',
    category: 'Костюмы и рубашки',
    fit: 'Slim',
    price: 134900,
    description: 'Строгий классический костюм из смесовой шерсти. Приталенный крой, однобортный пиджак на две пуговицы.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [{ name: 'Тёмно-синий', hex: '#1f2a44', images: [IMG.navySuitModel], stock: stock(1, 4, 5, 3, 1) }],
    brand: 'Без бренда',
    countryOfOrigin: 'Турция',
    season: 'Круглогодичный',
    material: 'Шерсть',
    composition: '80% шерсть, 20% полиэстер',
    characteristics: {
      Модель: 'Приталенная',
      'Тип изделия': 'Пиджак, брюки',
      Застёжка: 'На пуговицы, однобортный',
    },
  },
  {
    title: 'Рубашка классическая',
    category: 'Костюмы и рубашки',
    fit: 'Regular',
    price: 18900,
    description:
      'Рубашка из хлопковой ткани с лёгким эффектом твила. Классический воротник, приталенный силуэт, не требует глажки.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      { name: 'Серый', hex: '#6b6f76', images: [IMG.shirtsFolded], stock: stock(5, 10, 11, 7, 3) },
      { name: 'Бордовый', hex: '#5b2430', images: [IMG.shirtsFolded], stock: stock(3, 7, 8, 4, 2) },
      { name: 'Белый', hex: '#efece4', images: [IMG.shirtsFolded], stock: stock(6, 12, 12, 8, 4) },
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
    },
  },
  {
    title: 'Кроссовки повседневные',
    category: 'Обувь и аксессуары',
    fit: 'Regular',
    price: 54900,
    description: 'Кроссовки из комбинированных материалов на амортизирующей подошве. Подходят для ежедневной носки.',
    colors: [
      { name: 'Чёрный', hex: '#202020', images: [IMG.sneakerDark], stock: stock(0, 2, 4, 3, 0) },
      { name: 'Бежевый', hex: '#c8a06c', images: [IMG.sneakerTan], stock: stock(1, 3, 5, 2, 1) },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Китай',
    season: 'Демисезон',
    material: 'Текстиль',
    characteristics: {
      'Материал верха': 'Текстиль, комбинированный',
      'Материал подошвы': 'ЭВА',
      Застёжка: 'Шнурки',
    },
  },
  {
    title: 'Кепка бейсболка',
    category: 'Обувь и аксессуары',
    fit: 'Regular',
    price: 9900,
    description: 'Бейсболка из плотного хлопка с вышитым логотипом и регулировкой по размеру.',
    colors: [{ name: 'Серый', hex: '#55565c', images: [IMG.capGrey], stock: stock(8, 8, 8, 8, 8) }],
    brand: 'Без бренда',
    countryOfOrigin: 'Китай',
    season: 'Лето',
    material: 'Хлопок',
    composition: '100% хлопок',
    characteristics: {
      Застёжка: 'Регулируемая, на липучке',
    },
  },
  {
    title: 'Ботинки замшевые Челси',
    category: 'Обувь и аксессуары',
    fit: 'Regular',
    price: 47900,
    description: 'Ботинки Челси из натуральной замши на резинках, прошитая подошва.',
    colors: [{ name: 'Коричневый', hex: '#5a3b25', images: [IMG.bootsFlatlay], stock: stock(2, 4, 4, 3, 0) }],
    brand: 'Без бренда',
    countryOfOrigin: 'Турция',
    season: 'Демисезон',
    material: 'Замша',
    characteristics: {
      'Материал верха': 'Натуральная замша',
      'Материал подошвы': 'Резина, прошитая',
      Застёжка: 'Резинки по бокам',
    },
  },
  {
    title: 'Кроссовки street',
    category: 'Обувь и аксессуары',
    fit: 'Oversize',
    price: 44900,
    description: 'Массивные кроссовки в стиле street wear на высокой подошве, комбинация текстиля и замши.',
    colors: [
      { name: 'Бирюзовый', hex: '#1f6f6f', images: [IMG.sneakerTeal], stock: stock(3, 5, 6, 3, 1) },
      { name: 'Белый', hex: '#e8e3da', images: [IMG.sneakerWhiteOrange], stock: stock(2, 4, 5, 2, 0) },
    ],
    brand: 'Без бренда',
    countryOfOrigin: 'Китай',
    season: 'Демисезон',
    material: 'Текстиль',
    characteristics: {
      'Материал верха': 'Текстиль, замша',
      'Материал подошвы': 'ЭВА, амортизирующая',
      Застёжка: 'Шнурки',
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
