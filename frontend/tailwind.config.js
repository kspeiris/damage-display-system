/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === Existing Colors (Kept) ===
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        success: {
          500: '#10b981',
        },

        // === New Professional Disaster Response Palette ===
        brand: {
          DEFAULT: "#0B4F6C",
          light: "#106C94",
          dark: "#083A51",
        },

        secondary: {
          DEFAULT: "#F2B138",
          light: "#FFD36C",
          dark: "#C98F1E",
        },

        severity: {
          critical: "#D7263D",
          high: "#FF6B3B",
          medium: "#FFB400",
          low: "#66BB6A",
          info: "#1976D2",
        },

        surface: {
          light: "#FFFFFF",
          soft: "#F5F5F7",
          DEFAULT: "#E9E9EF",
          dark: "#C7C7D3",
        },

        text: {
          DEFAULT: "#1F2937",
          muted: "#6B7280",
          light: "#9CA3AF",
          inverse: "#FFFFFF",
        },

        alert: {
          success: "#4CAF50",
          warning: "#FF9800",
          error: "#F44336",
          info: "#2196F3",
        },

        marker: {
          critical: "#D7263D",
          high: "#E35D2F",
          medium: "#F2B138",
          low: "#5CB85C",
          default: "#0B4F6C",
        },

        border: {
          light: "#E5E7EB",
          DEFAULT: "#D1D5DB",
          dark: "#9CA3AF",
        },

        overlay: {
          light: "rgba(0,0,0,0.2)",
          DEFAULT: "rgba(0,0,0,0.5)",
          dark: "rgba(0,0,0,0.7)",
        },
      },

      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-emergency': 'pulse-emergency 2s infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'pulse-emergency': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}