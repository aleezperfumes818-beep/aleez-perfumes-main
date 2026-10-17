/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: "#FFFFFF",         // Crisp white
          card: "#FFFFFF",       // Pure white card surfaces
          cardHover: "#F7F7F7",  // Subtle light hover
          charcoal: "#171717",   // Deep obsidian noir
          border: "#E5E5E5",     // Clean light gray border
          borderDark: "#262626", // Deep dark border
          gold: "#0A0A0A",       // High fashion pure black primary
          goldHover: "#262626",  // Refined hover dark
          goldMuted: "#525252",  // Medium charcoal
          goldLight: "#F5F5F5",  // Crisp light gray background tint
          goldBorder: "#D4D4D4", // Refined border
          text: "#0A0A0A",       // Pure black for ultra-crisp typography
          textSecondary: "#404040", // Medium gray body
          textMuted: "#737373",   // Subtle muted gray
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.2em',
        widest2: '0.25em',
      },
      boxShadow: {
        'gold-sm': '0 2px 10px rgba(0, 0, 0, 0.08)',
        'gold-md': '0 4px 18px rgba(0, 0, 0, 0.12)',
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
        'card': '0 1px 4px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
