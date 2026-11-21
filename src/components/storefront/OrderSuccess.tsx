import { MessageCircle } from 'lucide-react';
import type { Order } from '../../types';
import { useSettings } from '../../hooks/useStore';
import { buildWhatsAppLink, buildWhatsAppOrderMessage } from '../../utils/whatsapp';
import { formatPrice } from '../../utils/format';

interface OrderSuccessProps {
  order: Order;
  onClose: () => void;
}

export default function OrderSuccess({ order, onClose }: OrderSuccessProps) {
  const [settings] = useSettings();
  const whatsappLink = buildWhatsAppLink(settings.whatsappPhone, buildWhatsAppOrderMessage(order));

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
        ✓
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-graphite-950">Спасибо за заказ!</p>
        <p className="mt-1 text-sm text-graphite-500">
          Заказ №{order.id} на сумму {formatPrice(order.total)} принят. Мы свяжемся с вами для подтверждения.
        </p>
      </div>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-display text-sm uppercase tracking-wider text-white hover:opacity-90"
      >
        <MessageCircle size={18} />
        Отправить заказ в WhatsApp
      </a>

      <button onClick={onClose} className="text-sm font-medium text-graphite-600 underline underline-offset-2">
        Продолжить покупки
      </button>
    </div>
  );
}
