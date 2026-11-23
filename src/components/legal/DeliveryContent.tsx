import { useSettings } from '../../hooks/useStore';

export default function DeliveryContent() {
  const [settings] = useSettings();

  return (
    <>
      <h3 className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        Способы получения заказа
      </h3>
      <ul className="mb-4 list-disc pl-5">
        <li className="mb-1">
          <strong>Самовывоз из магазина.</strong> {settings.address}. Часы работы:{' '}
          {settings.workingHours.map((wh, i) => (
            <span key={i}>
              {wh.days} {wh.hours}
              {i < settings.workingHours.length - 1 ? ', ' : ''}
            </span>
          ))}
          .
        </li>
        <li>
          <strong>Доставка по Усть-Каменогорску.</strong> Срок и стоимость доставки уточняются менеджером
          при подтверждении заказа и зависят от адреса и объёма заказа.
        </li>
      </ul>

      <h3 className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        Способы оплаты
      </h3>
      <ul className="mb-4 list-disc pl-5">
        <li className="mb-1">
          <strong>Kaspi QR / Kaspi Pay</strong> — оплата через приложение Kaspi.kz.
        </li>
        <li className="mb-1">
          <strong>Перевод на карту</strong> — реквизиты сообщаются при подтверждении заказа.
        </li>
        <li>
          <strong>Наличными при получении</strong> — при самовывозе или курьеру при доставке.
        </li>
      </ul>

      <p className="mb-4 rounded-lg bg-stone-50 px-3 py-2 text-xs text-graphite-500">
        После оформления заказа на сайте с вами свяжутся по телефону {settings.phoneDisplay} или в WhatsApp
        для подтверждения деталей.
      </p>

      <h3 className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        Возврат и обмен
      </h3>
      <p className="mb-3">
        В соответствии с Законом РК «О защите прав потребителей» вы можете обменять или вернуть товар
        надлежащего качества в течение <strong>14 календарных дней</strong> с момента покупки.
      </p>

      <h3 className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        Условия возврата
      </h3>
      <ul className="mb-4 list-disc pl-5">
        <li className="mb-1">товар не был в использовании, сохранены его товарный вид и ярлыки;</li>
        <li className="mb-1">сохранена упаковка товара (при наличии);</li>
        <li>есть подтверждение покупки (чек, переписка о заказе или данные заказа на сайте).</li>
      </ul>

      <h3 className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        Как оформить возврат или обмен
      </h3>
      <p className="mb-3">
        Напишите или позвоните по телефону {settings.phoneDisplay}, укажите номер заказа и причину
        обращения — мы согласуем удобный способ возврата (в магазине по адресу {settings.address} либо иначе
        по договорённости).
      </p>

      <h3 className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-graphite-800">
        Возврат денежных средств
      </h3>
      <p>
        Деньги возвращаются тем же способом, которым была произведена оплата, в срок, предусмотренный
        законодательством РК, после получения и проверки возвращаемого товара.
      </p>
    </>
  );
}
