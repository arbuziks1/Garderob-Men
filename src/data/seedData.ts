import type { Product, StockBySize, StoreSettings, PromoCode, Order } from '../types';
import { IMG } from './images';

function stock(s: number, m: number, l: number, xl: number, xxl: number): StockBySize {
  return { S: s, M: m, L: l, XL: xl, XXL: xxl };
}

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Кожаная куртка косуха',
    category: 'Верхняя одежда',
    fit: 'Slim',
    price: 89900,
    oldPrice: 109900,
    description:
      'Куртка-косуха из плотной эко-кожи с металлической фурнитурой. Плотная подкладка, прямой силуэт с небольшим зауживанием. Подходит для прохладной погоды как самостоятельный верх или слой под пальто.',
    modelNote: 'На модели размер L, рост 184 см',
    colors: [
      {
        id: 'p1c1',
        name: 'Чёрный',
        hex: '#16161a',
        images: [IMG.leatherJacketProduct, IMG.leatherJacketModel],
        stock: stock(2, 6, 8, 5, 0),
      },
    ],
    createdAt: '2026-09-02T10:00:00.000Z',
  },
  {
    id: 'p2',
    title: 'Джинсовая куртка классическая',
    category: 'Верхняя одежда',
    fit: 'Regular',
    price: 42900,
    description:
      'Плотный деним средней плотности, усиленные швы, нагрудные карманы на кнопках. Универсальная куртка на весну и осень, хорошо сочетается с худи и рубашками.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      {
        id: 'p2c1',
        name: 'Синий деним',
        hex: '#3e5572',
        images: [IMG.denimJacketProduct, IMG.denimJacketModel],
        stock: stock(4, 9, 10, 7, 3),
      },
    ],
    createdAt: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'p3',
    title: 'Бомбер стёганый',
    category: 'Верхняя одежда',
    fit: 'Oversize',
    price: 36900,
    oldPrice: 44900,
    description:
      'Лёгкий утеплённый бомбер на молнии с резинкой по низу и манжетам. Оверсайз-крой для свободной посадки поверх худи или свитшота.',
    modelNote: 'На модели размер XL, рост 186 см',
    colors: [
      {
        id: 'p3c1',
        name: 'Терракотовый',
        hex: '#9c5a35',
        images: [IMG.bomberProduct],
        stock: stock(0, 3, 6, 4, 2),
      },
      {
        id: 'p3c2',
        name: 'Чёрный',
        hex: '#141414',
        images: [IMG.quiltedJacketModel],
        stock: stock(3, 7, 9, 6, 0),
      },
    ],
    createdAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'p4',
    title: 'Худи оверсайз базовое',
    category: 'Худи и свитшоты',
    fit: 'Oversize',
    price: 24900,
    description:
      'Плотный футер трёхнитка с начёсом, капюшон на кулиске, карман-кенгуру. Свободный оверсайз-силуэт, рукав реглан.',
    modelNote: 'На модели размер L, рост 182 см',
    colors: [
      {
        id: 'p4c1',
        name: 'Серый меланж',
        hex: '#8a8a8f',
        images: [IMG.hoodieGreyModel],
        stock: stock(5, 10, 12, 8, 4),
      },
    ],
    createdAt: '2026-09-12T10:00:00.000Z',
  },
  {
    id: 'p5',
    title: 'Свитшот базовый',
    category: 'Худи и свитшоты',
    fit: 'Regular',
    price: 22900,
    description:
      'Классический свитшот без капюшона из плотного хлопкового футера. Прямой крой, рибана на манжетах и низе изделия.',
    modelNote: 'На модели размер M, рост 178 см',
    colors: [
      {
        id: 'p5c1',
        name: 'Белый',
        hex: '#f2f1ec',
        images: [IMG.sweatshirtWhiteProduct],
        stock: stock(6, 10, 10, 6, 2),
      },
    ],
    createdAt: '2026-09-14T10:00:00.000Z',
  },
  {
    id: 'p6',
    title: 'Свитшот оверсайз с принтом',
    category: 'Худи и свитшоты',
    fit: 'Oversize',
    price: 19900,
    oldPrice: 26900,
    description:
      'Оверсайз-свитшот плотностью 320 г/м² с графичным принтом. Свободная посадка, двойная строчка по горловине.',
    modelNote: 'На модели размер L, рост 183 см',
    colors: [
      {
        id: 'p6c1',
        name: 'Чёрный с принтом',
        hex: '#161616',
        images: [IMG.graphicTeeModel],
        stock: stock(4, 8, 9, 5, 2),
      },
      {
        id: 'p6c2',
        name: 'Розовый пудровый',
        hex: '#d99a86',
        images: [IMG.pinkSweatshirtModel],
        stock: stock(2, 4, 4, 2, 0),
      },
    ],
    createdAt: '2026-09-16T10:00:00.000Z',
  },
  {
    id: 'p7',
    title: 'Джинсы зауженные',
    category: 'Брюки и джинсы',
    fit: 'Slim',
    price: 27900,
    description:
      'Зауженные джинсы из плотного стрейч-денима. Средняя посадка, лёгкие потёртости, пять карманов.',
    modelNote: 'На модели размер 32, соответствует M',
    colors: [
      {
        id: 'p7c1',
        name: 'Синий',
        hex: '#35526b',
        images: [IMG.jeansRackProduct],
        stock: stock(3, 8, 9, 5, 0),
      },
    ],
    createdAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'p8',
    title: 'Чиносы Slim',
    category: 'Брюки и джинсы',
    fit: 'Slim',
    price: 25900,
    description:
      'Хлопковые чиносы зауженного кроя. Эластичный пояс, скрытые карманы, низ зафиксирован манжетой.',
    modelNote: 'На модели размер M, рост 179 см',
    colors: [
      {
        id: 'p8c1',
        name: 'Хаки',
        hex: '#9c8558',
        images: [IMG.chinosModel],
        stock: stock(5, 9, 10, 6, 3),
      },
    ],
    createdAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'p9',
    title: 'Джинсы прямого кроя',
    category: 'Брюки и джинсы',
    fit: 'Regular',
    price: 29900,
    description:
      'Джинсы прямого силуэта из плотного денима без эластана. Классическая посадка на талии, пять карманов.',
    modelNote: 'На модели размер M, рост 181 см',
    colors: [
      {
        id: 'p9c1',
        name: 'Тёмно-синий',
        hex: '#24344a',
        images: [IMG.outfitFlatlay],
        stock: stock(2, 6, 7, 4, 1),
      },
    ],
    createdAt: '2026-09-22T10:00:00.000Z',
  },
  {
    id: 'p10',
    title: 'Костюм-тройка в клетку',
    category: 'Костюмы и рубашки',
    fit: 'Slim',
    price: 149900,
    oldPrice: 179900,
    description:
      'Костюм-тройка из шерстяной смеси в клетку: пиджак, жилет и брюки. Приталенный силуэт, подкладка из вискозы.',
    modelNote: 'На модели размер L, рост 185 см',
    colors: [
      {
        id: 'p10c1',
        name: 'Синяя клетка',
        hex: '#3b4a63',
        images: [IMG.checkSuitModel],
        stock: stock(0, 2, 3, 2, 1),
      },
    ],
    createdAt: '2026-09-24T10:00:00.000Z',
  },
  {
    id: 'p11',
    title: 'Костюм классический',
    category: 'Костюмы и рубашки',
    fit: 'Slim',
    price: 134900,
    description:
      'Строгий классический костюм из смесовой шерсти. Приталенный крой, однобортный пиджак на две пуговицы.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      {
        id: 'p11c1',
        name: 'Тёмно-синий',
        hex: '#1f2a44',
        images: [IMG.navySuitModel],
        stock: stock(1, 4, 5, 3, 1),
      },
    ],
    createdAt: '2026-09-26T10:00:00.000Z',
  },
  {
    id: 'p12',
    title: 'Рубашка классическая',
    category: 'Костюмы и рубашки',
    fit: 'Regular',
    price: 18900,
    description:
      'Рубашка из хлопковой ткани с лёгким эффектом твила. Классический воротник, приталенный силуэт, не требует глажки.',
    modelNote: 'На модели размер M, рост 180 см',
    colors: [
      {
        id: 'p12c1',
        name: 'Серый',
        hex: '#6b6f76',
        images: [IMG.shirtsFolded],
        stock: stock(5, 10, 11, 7, 3),
      },
      {
        id: 'p12c2',
        name: 'Бордовый',
        hex: '#5b2430',
        images: [IMG.shirtsFolded],
        stock: stock(3, 7, 8, 4, 2),
      },
      {
        id: 'p12c3',
        name: 'Белый',
        hex: '#efece4',
        images: [IMG.shirtsFolded],
        stock: stock(6, 12, 12, 8, 4),
      },
    ],
    createdAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'p13',
    title: 'Кроссовки повседневные',
    category: 'Обувь и аксессуары',
    fit: 'Regular',
    price: 54900,
    description:
      'Кроссовки из комбинированных материалов на амортизирующей подошве. Подходят для ежедневной носки.',
    colors: [
      {
        id: 'p13c1',
        name: 'Чёрный',
        hex: '#202020',
        images: [IMG.sneakerDark],
        stock: stock(0, 2, 4, 3, 0),
      },
      {
        id: 'p13c2',
        name: 'Бежевый',
        hex: '#c8a06c',
        images: [IMG.sneakerTan],
        stock: stock(1, 3, 5, 2, 1),
      },
    ],
    createdAt: '2026-09-30T10:00:00.000Z',
  },
  {
    id: 'p14',
    title: 'Кепка бейсболка',
    category: 'Обувь и аксессуары',
    fit: 'Regular',
    price: 9900,
    description: 'Бейсболка из плотного хлопка с вышитым логотипом и регулировкой по размеру.',
    colors: [
      {
        id: 'p14c1',
        name: 'Серый',
        hex: '#55565c',
        images: [IMG.capGrey],
        stock: stock(8, 8, 8, 8, 8),
      },
    ],
    createdAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'p15',
    title: 'Ботинки замшевые Челси',
    category: 'Обувь и аксессуары',
    fit: 'Regular',
    price: 47900,
    description: 'Ботинки Челси из натуральной замши на резинках, прошитая подошва.',
    colors: [
      {
        id: 'p15c1',
        name: 'Коричневый',
        hex: '#5a3b25',
        images: [IMG.bootsFlatlay],
        stock: stock(2, 4, 4, 3, 0),
      },
    ],
    createdAt: '2026-10-04T10:00:00.000Z',
  },
  {
    id: 'p16',
    title: 'Кроссовки street',
    category: 'Обувь и аксессуары',
    fit: 'Oversize',
    price: 44900,
    description: 'Массивные кроссовки в стиле street wear на высокой подошве, комбинация текстиля и замши.',
    colors: [
      {
        id: 'p16c1',
        name: 'Бирюзовый',
        hex: '#1f6f6f',
        images: [IMG.sneakerTeal],
        stock: stock(3, 5, 6, 3, 1),
      },
      {
        id: 'p16c2',
        name: 'Белый',
        hex: '#e8e3da',
        images: [IMG.sneakerWhiteOrange],
        stock: stock(2, 4, 5, 2, 0),
      },
    ],
    createdAt: '2026-10-06T10:00:00.000Z',
  },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'GARDEROB MEN',
  address: 'г. Усть-Каменогорск, ул. Протозанова, 123 (демо-адрес — обновите в Настройках)',
  workingHours: [
    { days: 'Пн–Сб', hours: '10:00–20:00' },
    { days: 'Вс', hours: '11:00–18:00' },
  ],
  whatsappPhone: '+77012345678',
  phoneDisplay: '+7 (701) 234-56-78',
  kaspiPayLink: '',
  instagramUrl: 'https://www.instagram.com/garderob.men',
  twoGisUrl: 'https://go.2gis.com/ev4n5',
  heroTitle: 'GARDEROB MEN',
  heroSubtitle: 'Мужской гардероб для города. Новая коллекция — верхняя одежда, трикотаж и обувь.',
  heroImage: IMG.quiltedJacketModel,
  heroCtaLabel: 'Смотреть каталог',
};

export const DEFAULT_PROMO_CODES: PromoCode[] = [
  { id: 'promo1', code: 'GARDEROB10', discountPercent: 10, active: true },
  { id: 'promo2', code: 'WELCOME15', discountPercent: 15, active: true },
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'o1001',
    createdAt: '2026-11-15T09:20:00.000Z',
    customerName: 'Арман Жаксыбеков',
    phone: '+77052223344',
    delivery: 'Самовывоз из магазина',
    payment: 'Kaspi QR',
    items: [
      { productId: 'p1', title: 'Кожаная куртка косуха', colorName: 'Чёрный', size: 'L', price: 89900, quantity: 1 },
    ],
    subtotal: 89900,
    discount: 0,
    total: 89900,
    status: 'Выдан / Доставлен',
  },
  {
    id: 'o1002',
    createdAt: '2026-11-17T14:05:00.000Z',
    customerName: 'Дамир Сапаров',
    phone: '+77015558899',
    delivery: 'Доставка по Усть-Каменогорску',
    payment: 'Перевод',
    items: [
      { productId: 'p4', title: 'Худи оверсайз базовое', colorName: 'Серый меланж', size: 'M', price: 24900, quantity: 2 },
      { productId: 'p14', title: 'Кепка бейсболка', colorName: 'Серый', size: 'M', price: 9900, quantity: 1 },
    ],
    subtotal: 59700,
    discount: 5970,
    promoCode: 'GARDEROB10',
    total: 53730,
    status: 'Подтвержден',
  },
  {
    id: 'o1003',
    createdAt: '2026-11-19T11:40:00.000Z',
    customerName: 'Ержан Абенов',
    phone: '+77073334455',
    delivery: 'Самовывоз из магазина',
    payment: 'Наличными при получении',
    items: [
      { productId: 'p11', title: 'Костюм классический', colorName: 'Тёмно-синий', size: 'M', price: 134900, quantity: 1 },
    ],
    subtotal: 134900,
    discount: 0,
    total: 134900,
    status: 'Новый',
  },
  {
    id: 'o1004',
    createdAt: '2026-11-20T18:10:00.000Z',
    customerName: 'Нурлан Касымов',
    phone: '+77081112233',
    delivery: 'Доставка по Усть-Каменогорску',
    payment: 'Kaspi QR',
    items: [
      { productId: 'p7', title: 'Джинсы зауженные', colorName: 'Синий', size: 'L', price: 27900, quantity: 1 },
      { productId: 'p12', title: 'Рубашка классическая', colorName: 'Белый', size: 'L', price: 18900, quantity: 1 },
    ],
    subtotal: 46800,
    discount: 0,
    total: 46800,
    status: 'Новый',
  },
  {
    id: 'o1005',
    createdAt: '2026-11-13T08:00:00.000Z',
    customerName: 'Тимур Оспанов',
    phone: '+77091234567',
    delivery: 'Самовывоз из магазина',
    payment: 'Перевод',
    items: [
      { productId: 'p13', title: 'Кроссовки повседневные', colorName: 'Бежевый', size: 'M', price: 54900, quantity: 1 },
    ],
    subtotal: 54900,
    discount: 0,
    total: 54900,
    status: 'Отменен',
  },
];
