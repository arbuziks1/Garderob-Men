import { useSettings } from '../../hooks/useStore';
import LegalModal from './LegalModal';

interface DeliveryPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DeliveryPaymentModal({ open, onClose }: DeliveryPaymentModalProps) {
  const [settings] = useSettings();

  return (
    <LegalModal open={open} onClose={onClose} title="Оплата и доставка">
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

      <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-graphite-500">
        После оформления заказа на сайте с вами свяжутся по телефону {settings.phoneDisplay} или в WhatsApp
        для подтверждения деталей.
      </p>
    </LegalModal>
  );
}
