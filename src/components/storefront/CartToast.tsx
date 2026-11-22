import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { EASE } from '../../utils/motion';

export default function CartToast() {
  const { toast } = useCart();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex items-center gap-2 rounded-sm bg-graphite-950 px-4 py-3 text-sm text-paper shadow-lg"
          >
            <Check size={15} className="shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
