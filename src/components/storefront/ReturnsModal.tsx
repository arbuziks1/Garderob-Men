import { useSettings } from '../../hooks/useStore';
import LegalModal from './LegalModal';

interface ReturnsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ReturnsModal({ open, onClose }: ReturnsModalProps) {
  const [settings] = useSettings();

  return (
    <LegalModal open={open} onClose={onClose} title="Возврат и обмен">
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
    </LegalModal>
  );
}
