import { Clock, MapPin } from 'lucide-react';
import type { StoreSettings } from '../../types';
import SafeImage from '../shared/SafeImage';

interface HeroBannerProps {
  settings: StoreSettings;
  onShopClick: () => void;
}

export default function HeroBanner({ settings, onShopClick }: HeroBannerProps) {
  return (
    <section id="top" className="relative overflow-hidden bg-graphite-950 text-paper">
      <SafeImage
        src={settings.heroImage}
        alt={settings.heroTitle}
        className="absolute inset-0 h-full w-full object-cover object-top opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-graphite-950 via-graphite-950/70 to-graphite-950/20" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:items-end lg:justify-between lg:py-32">
        <div className="max-w-xl">
          <p className="mb-3 font-display text-sm uppercase tracking-[0.3em] text-ember-light">
            Усть-Каменогорск
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {settings.heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-base text-stone-300 sm:text-lg">{settings.heroSubtitle}</p>
          <button
            onClick={onShopClick}
            className="mt-8 rounded-full bg-ember px-7 py-3 font-display text-sm uppercase tracking-wider text-white transition-colors hover:bg-ember-light"
          >
            {settings.heroCtaLabel}
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-graphite-900/70 p-5 backdrop-blur-sm sm:min-w-[280px]">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-ember-light" />
            <p className="text-sm text-stone-200">{settings.address}</p>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={18} className="mt-0.5 shrink-0 text-ember-light" />
            <div className="text-sm text-stone-200">
              {settings.workingHours.map((wh, i) => (
                <p key={i}>
                  {wh.days}: {wh.hours}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
