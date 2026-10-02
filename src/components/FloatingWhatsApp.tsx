import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface FloatingWhatsAppProps {
  currentProductName?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ currentProductName }) => {
  const { getWhatsAppUrl } = useSettings();
  const [isHovered, setIsHovered] = useState(false);

  const href = getWhatsAppUrl(currentProductName);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center">
      {/* Tooltip on hover */}
      {isHovered && (
        <div className="hidden sm:block mr-3 px-3 py-1.5 bg-black/90 backdrop-blur-md border border-luxury-border text-white text-xs rounded shadow-lg animate-fade-in whitespace-nowrap">
          {currentProductName
            ? `Inquire about ${currentProductName}`
            : 'Inquire on WhatsApp'}
        </div>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none"
        aria-label="Chat with Aleez Perfumes on WhatsApp"
      >
        {/* Subtle pulsing background ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping opacity-75"></span>

        <MessageCircle className="w-7 h-7 fill-white text-white relative z-10" />
      </a>
    </div>
  );
};
