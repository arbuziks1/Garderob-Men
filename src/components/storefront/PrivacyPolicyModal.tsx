import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useSettings } from '../../hooks/useStore';
import { EASE } from '../../utils/motion';

interface PrivacyPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ open, onClose }: PrivacyPolicyModalProps) {
  const [settings] = useSettings();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-sm bg-white"
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <h2 className="font-display text-lg font-semibold text-graphite-950">
                Политика конфиденциальности
              </h2>
              <button onClick={onClose} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-graphite-700">
              <p className="mb-3">
                Оформляя заказ на сайте {settings.storeName}, вы указываете имя, номер телефона и, при
                желании, комментарий к заказу. Эти данные используются только для одной цели — обработки
                и доставки вашего заказа, а также связи с вами для подтверждения.
              </p>
              <p className="mb-3">
                <strong>Как и где хранятся данные.</strong> Сайт не передаёт введённые данные на сторонний
                сервер и не ведёт отдельную базу данных. Информация о заказе сохраняется локально в
                браузере на вашем устройстве, а продавцу она попадает в виде сообщения, которое вы сами
                отправляете через WhatsApp. Данные не продаются и не передаются третьим лицам.
              </p>
              <p className="mb-3">
                <strong>Срок хранения.</strong> Данные остаются в браузере до тех пор, пока вы не очистите
                его хранилище, либо до выполнения заказа.
              </p>
              <p className="mb-3">
                <strong>Ваши права.</strong> Вы можете в любой момент запросить у продавца информацию о
                том, какие ваши данные ему передавались, потребовать их исправления, удаления или
                ограничения обработки — для этого достаточно написать по контактам ниже.
              </p>
              <p>
                <strong>Контакты по вопросам персональных данных:</strong> {settings.phoneDisplay},{' '}
                {settings.address}.
              </p>
            </div>

            <div className="border-t border-stone-200 p-5">
              <button
                onClick={onClose}
                className="w-full rounded-sm bg-graphite-950 py-3 text-sm font-medium uppercase tracking-wider text-white"
              >
                Понятно
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
