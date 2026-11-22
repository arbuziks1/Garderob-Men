import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import type { StoreSettings } from '../../types';
import { EASE } from '../../utils/motion';
import SafeImage from '../shared/SafeImage';

interface HeroBannerProps {
  settings: StoreSettings;
  onShopClick: () => void;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

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
        <motion.div initial="hidden" animate="visible" variants={container} className="max-w-xl">
          <motion.div variants={item} className="mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-stone-400" />
            <p className="font-display text-xs uppercase tracking-[0.35em] text-stone-300">
              Осень / Зима — Усть-Каменогорск
            </p>
          </motion.div>
          <motion.h1
            variants={item}
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {settings.heroTitle}
          </motion.h1>
          <motion.p variants={item} className="mt-5 max-w-md text-base font-light text-stone-300 sm:text-lg">
            {settings.heroSubtitle}
          </motion.p>
          <motion.button
            variants={item}
            onClick={onShopClick}
            whileTap={{ scale: 0.97 }}
            className="mt-9 rounded-sm bg-ember px-8 py-3 font-display text-xs uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ember-light"
          >
            {settings.heroCtaLabel}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          className="flex flex-col gap-3 rounded-sm border border-white/10 bg-graphite-900/70 p-5 backdrop-blur-sm sm:min-w-[280px]"
        >
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-stone-400" />
            <p className="text-sm text-stone-200">{settings.address}</p>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={18} className="mt-0.5 shrink-0 text-stone-400" />
            <div className="text-sm text-stone-200">
              {settings.workingHours.map((wh, i) => (
                <p key={i}>
                  {wh.days}: {wh.hours}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
