import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { dbService } from '../lib/supabase';
import { initialSettings } from '../lib/initialData';

interface SettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  getWhatsAppUrl: (productName?: string) => string;
  formatPrice: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await dbService.getSettings();
        setSettings(data);
      } catch (err) {
        console.warn('Could not load settings:', err);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const updated = await dbService.saveSettings(newSettings);
      setSettings(updated);
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const getWhatsAppUrl = (productName?: string) => {
    // Sanitize phone number (strip spaces, +, hyphens)
    const cleanNumber = settings.phone.replace(/[^0-9]/g, '');
    const message = productName
      ? `Hi Aleez Perfumes, I would like to inquire about "${productName}".`
      : 'Hi Aleez Perfumes, I would like to know more about your fragrances.';

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const formatPrice = (amount: number) => {
    return `${settings.currency_symbol || '₹'}${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        getWhatsAppUrl,
        formatPrice,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
