import { useSettings } from '../../hooks/useStore';

export default function OfferContent() {
  const [settings] = useSettings();
  const seller = settings.legalName.trim() || '[юридическое название не указано продавцом]';
  const bin = settings.businessId.trim() || '[БИН/ИИН не указан продавцом]';

  return (
    <>
      <p className="mb-3">
        Настоящий документ является публичной офертой {seller} (БИН/ИИН {bin}), далее — «Продавец»,
        адресованной неограниченному кругу лиц и содержащей условия продажи товаров через интернет-магазин{' '}
        {settings.storeName} ({typeof window !== 'undefined' ? window.location.hostname : ''}).
      </p>

      <h3 className="mb-1.5 mt-4 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        1. Термины
      </h3>
      <p className="mb-3">
        <strong>Интернет-магазин</strong> — сайт {settings.storeName}. <strong>Покупатель</strong> — физическое
        лицо, оформляющее заказ. <strong>Товар</strong> — продукция, представленная в каталоге сайта.{' '}
        <strong>Заказ</strong> — запрос Покупателя на приобретение Товара, оформленный через корзину сайта.
      </p>

      <h3 className="mb-1.5 mt-4 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        2. Принятие оферты
      </h3>
      <p className="mb-3">
        Оформление Заказа на сайте (заполнение формы и нажатие кнопки «Подтвердить заказ») является полным и
        безоговорочным принятием (акцептом) настоящей оферты Покупателем.
      </p>

      <h3 className="mb-1.5 mt-4 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        3. Цена и оплата
      </h3>
      <p className="mb-3">
        Цены на Товары указаны на сайте в тенге (₸) и могут быть изменены Продавцом в одностороннем
        порядке до момента оформления Заказа. Оплата производится способом, выбранным Покупателем при
        оформлении Заказа: Kaspi QR, банковским переводом либо наличными при получении.
      </p>

      <h3 className="mb-1.5 mt-4 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        4. Доставка
      </h3>
      <p className="mb-3">
        Способ получения Товара (самовывоз из магазина по адресу {settings.address} либо доставка по
        Усть-Каменогорску) выбирается Покупателем при оформлении Заказа. Сроки и стоимость доставки
        согласовываются индивидуально при подтверждении Заказа.
      </p>

      <h3 className="mb-1.5 mt-4 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        5. Возврат и обмен
      </h3>
      <p className="mb-3">
        Покупатель вправе обменять или вернуть Товар надлежащего качества в течение 14 календарных дней в
        соответствии с Законом РК «О защите прав потребителей» — подробные условия на странице «Оплата,
        доставка и возврат».
      </p>

      <h3 className="mb-1.5 mt-4 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        6. Контакты Продавца
      </h3>
      <p>
        {seller}, БИН/ИИН {bin}. Адрес: {settings.address}. Телефон: {settings.phoneDisplay}.
      </p>
    </>
  );
}
