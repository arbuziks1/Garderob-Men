import LegalModal from './LegalModal';
import OfferContent from '../legal/OfferContent';

interface PublicOfferModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PublicOfferModal({ open, onClose }: PublicOfferModalProps) {
  return (
    <LegalModal open={open} onClose={onClose} title="Договор публичной оферты">
      <OfferContent />
    </LegalModal>
  );
}
