import { Link } from 'react-router-dom';
import { AtSign, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { StoreSettings } from '../../types';
import { useBranches } from '../../hooks/useStore';
import { buildWhatsAppLink } from '../../utils/whatsapp';

interface FooterProps {
  settings: StoreSettings;
}

export default function Footer({ settings }: FooterProps) {
  const [branches] = useBranches();

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

          <div className="flex flex-col gap-3 text-sm">
            <p className="flex items-center gap-2">
              <Phone size={16} className="shrink-0" />
              {settings.phoneDisplay}
            </p>
            {branches.map((branch) => (
              <div key={branch.id} className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p>
                    {branch.name} — {branch.address}
                  </p>
                  {branch.workingHours.map((wh, i) => (
                    <p key={i} className="text-stone-400">
                      {wh.days}: {wh.hours}
                    </p>
                  ))}
                  {branch.twoGisUrl && (
                    <a
                      href={branch.twoGisUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 underline underline-offset-2 hover:text-paper"
                    >
                      Открыть в 2ГИС
                    </a>
                  )}
                </div>
              </div>
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
