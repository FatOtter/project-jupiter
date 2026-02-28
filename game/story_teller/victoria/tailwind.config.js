/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#18181b', // zinc-900
        'game-text': '#22c55e', // emerald-500
        'game-text-dim': '#a1a1aa', // zinc-400
        'victoria': '#a78bfa', // violet-400
        'antagonist': '#f87171', // red-400
        'wildcard': '#fbbf24', // amber-400
        'companion': '#34d399', // emerald-400
        'game-border': '#3f3f46', // zinc-700
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        flicker: {
          '0%': { opacity: '0.9' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.9' },
        }
      }
    },
  },
  plugins: [],
}
