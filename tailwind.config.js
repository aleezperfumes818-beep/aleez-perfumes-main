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
          bg: "#FAF9F6",         // Luminous alabaster / warm light cream
          card: "#FFFFFF",       // Pure white card surfaces
          cardHover: "#FCFBF9",  // Subtle warm hover
          charcoal: "#F5F2EB",   // Soft light accent surface
          border: "#EAE5DC",     // Refined delicate warm border
          borderDark: "#D8D0C3", // Slightly deeper border
          gold: "#B8860B",       // Rich warm gold
          goldHover: "#9E7307",  // Deeper gold for hover
          goldMuted: "#A67C1E",  // Muted gold
          goldLight: "#FAF4E6",  // Soft light gold background tint
          goldBorder: "#DFC38A", // Delicate gold border
          text: "#141414",       // Deep rich charcoal for readability
          textSecondary: "#525252", // Medium gray body
          textMuted: "#787878",   // Subtle muted gray
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
        'gold-sm': '0 2px 12px rgba(184, 134, 11, 0.15)',
        'gold-md': '0 4px 20px rgba(184, 134, 11, 0.22)',
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.07)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.03)',
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
