import { Camera, MapPin, Phone } from 'lucide-react';
import type { StoreSettings } from '../../types';

interface FooterProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
}

export default function Footer({ settings, onOpenAdmin }: FooterProps) {
  return (
    <footer className="mt-12 bg-graphite-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg font-bold tracking-wide text-paper">
              GARDEROB <span className="text-ember-light">MEN</span>
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
              <Camera size={16} /> Instagram
            </a>
            <a
              href={settings.twoGisUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:text-paper"
            >
              <MapPin size={16} /> Открыть на карте 2ГИС
            </a>
            <button
              onClick={onOpenAdmin}
              className="mt-4 rounded-full border border-graphite-700 px-3 py-1.5 text-xs text-stone-500 hover:border-stone-400 hover:text-stone-200"
            >
              Админ-панель
            </button>
          </div>
        </div>

        <p className="mt-8 border-t border-graphite-800 pt-6 text-xs text-stone-500">
          © {new Date().getFullYear()} GARDEROB MEN. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
