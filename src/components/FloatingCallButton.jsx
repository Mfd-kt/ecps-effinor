import React from 'react';
import { Phone } from 'lucide-react';

const FloatingCallButton = () => {
  return (
    <a
      href="tel:+33978455063"
      className="floating-call-btn"
      title="Appelez-nous maintenant : 09 78 45 50 63"
      aria-label="Appeler EFFINOR"
    >
      <Phone size={32} />
    </a>
  );
};

export default FloatingCallButton;