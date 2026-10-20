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
        <div className="hidden sm:block mr-3 px-3 py-1.5 bg-black/95 backdrop-blur-md border border-neutral-800 text-white text-xs rounded shadow-lg animate-fade-in whitespace-nowrap">
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
        className="relative group w-14 h-14 bg-black hover:bg-neutral-800 text-white rounded-full flex items-center justify-center shadow-2xl border border-neutral-700 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        aria-label="Chat with Aleez Perfumes on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white text-white relative z-10" />
      </a>
    </div>
  );
};
