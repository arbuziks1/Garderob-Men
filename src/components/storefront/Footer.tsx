import { Link } from 'react-router-dom';
import { AtSign, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { StoreSettings } from '../../types';
import { buildWhatsAppLink } from '../../utils/whatsapp';

interface FooterProps {
  settings: StoreSettings;
}

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="mt-12 bg-graphite-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg tracking-wide text-paper">
              <span className="font-bold">GARDEROB</span> <span className="font-normal text-stone-300">MEN</span>
            </p>
            <p className="mt-2 text-sm">Мужская одежда в Усть-Каменогорске.</p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              {settings.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="shrink-0" />
              {settings.phoneDisplay}
            </p>
            {settings.workingHours.map((wh, i) => (
              <p key={i} className="pl-6 text-stone-400">
                {wh.days}: {wh.hours}
              </p>
            ))}
          </div>

          <div className="flex flex-col items-start gap-3">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:text-paper"
            >
              <AtSign size={16} /> Instagram
            </a>
            <a
              href={settings.twoGisUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:text-paper"
            >
              <MapPin size={16} /> Открыть на карте 2ГИС
            </a>
            <a
              href={buildWhatsAppLink(settings.whatsappPhone, 'Здравствуйте! У меня вопрос по...')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:text-paper"
            >
              <MessageCircle size={16} /> Поддержка в WhatsApp
            </a>
            <Link
              to="/admin"
              className="mt-4 rounded-sm border border-graphite-700 px-3 py-1.5 text-[11px] uppercase tracking-wider text-stone-500 hover:border-stone-300 hover:text-stone-100"
            >
              Админ-панель
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-graphite-800 pt-6 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} GARDEROB MEN. Все права защищены.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/offer" className="underline underline-offset-2 hover:text-stone-300">
              Договор публичной оферты
            </Link>
            <Link to="/delivery" className="underline underline-offset-2 hover:text-stone-300">
              Оплата, доставка и возврат
            </Link>
            <Link to="/privacy" className="underline underline-offset-2 hover:text-stone-300">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
