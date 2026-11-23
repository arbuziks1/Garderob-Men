import { useSettings } from '../../hooks/useStore';
import LegalModal from './LegalModal';

interface PrivacyPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ open, onClose }: PrivacyPolicyModalProps) {
  const [settings] = useSettings();

  return (
    <LegalModal open={open} onClose={onClose} title="Политика конфиденциальности">
      <p className="mb-3">
        Оформляя заказ на сайте {settings.storeName}, вы указываете имя, номер телефона и, при желании,
        комментарий к заказу. Эти данные используются только для одной цели — обработки и доставки вашего
        заказа, а также связи с вами для подтверждения.
      </p>
      <p className="mb-3">
        <strong>Как и где хранятся данные.</strong> Сайт не передаёт введённые данные на сторонний сервер и
        не ведёт отдельную базу данных. Информация о заказе сохраняется локально в браузере на вашем
        устройстве, а продавцу она попадает в виде сообщения, которое вы сами отправляете через WhatsApp.
        Данные не продаются и не передаются третьим лицам.
      </p>
      <p className="mb-3">
        <strong>Срок хранения.</strong> Данные остаются в браузере до тех пор, пока вы не очистите его
        хранилище, либо до выполнения заказа.
      </p>
      <p className="mb-3">
        <strong>Ваши права.</strong> Вы можете в любой момент запросить у продавца информацию о том, какие
        ваши данные ему передавались, потребовать их исправления, удаления или ограничения обработки — для
        этого достаточно написать по контактам ниже.
      </p>
      <p>
        <strong>Контакты по вопросам персональных данных:</strong> {settings.phoneDisplay}, {settings.address}
        .
      </p>
    </LegalModal>
  );
}
