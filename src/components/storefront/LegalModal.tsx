import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { EASE } from '../../utils/motion';

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function LegalModal({ open, onClose, title, children }: LegalModalProps) {
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
              <h2 className="font-display text-lg font-semibold text-graphite-950">{title}</h2>
              <button onClick={onClose} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-graphite-700">
              {children}
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
