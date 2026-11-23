import LegalModal from './LegalModal';
import PrivacyContent from '../legal/PrivacyContent';

interface PrivacyPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ open, onClose }: PrivacyPolicyModalProps) {
  return (
    <LegalModal open={open} onClose={onClose} title="Политика конфиденциальности">
      <PrivacyContent />
    </LegalModal>
  );
}
