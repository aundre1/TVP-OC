/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'tvp-bg': {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
        },
        'tvp-text': {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        'tvp-accent': {
          cyan: 'var(--accent-cyan)',
          'cyan-hover': 'var(--accent-cyan-hover)',
          'cyan-glow': 'var(--accent-cyan-glow)',
          'cyan-subtle': 'var(--accent-cyan-subtle)',
          gold: 'var(--accent-gold)',
          coral: 'var(--accent-coral)',
          purple: 'var(--accent-purple)',
        },
        'tvp-border': {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
        },
        'tvp-status': {
          success: 'var(--success)',
          warning: 'var(--warning)',
          error: 'var(--error)',
        },
        // Quality colors (Council Approved)
        'quality': {
          '4k': '#FFD700',      // Gold - Premium
          '1080p': '#00d4ff',   // Cyan - Default
          '720p': '#6B8E23',    // Olive - HD Entry
          '480p': '#CD853F',    // Tan - SD Standard
          '320p': '#8B7355',    // Bronze - Legacy
        },
      },
      fontFamily: {
        'bebas': ['"Bebas Neue"', 'sans-serif'],
        'inter': ['Inter', '-apple-system', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'elevated': '0 12px 40px rgba(0, 0, 0, 0.5)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-cyan-strong': '0 0 15px var(--accent-cyan-glow)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.3)',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'logo-glow': 'logoGlow 4s ease-in-out infinite',
        'toast-in': 'toastIn 0.3s ease-out',
        'toast-out': 'toastOut 0.3s ease-out forwards',
        'shortcut-pop': 'shortcutPop 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        logoGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 2px rgba(0, 212, 255, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.6))' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        toastOut: {
          from: { opacity: '1', transform: 'translateY(0) scale(1)' },
          to: { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
        },
        shortcutPop: {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.5)' },
          '50%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1.1)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      borderRadius: {
        'pill': '999px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        '200': '200',
        '400': '400',
        '500': '500',
        '1000': '1000',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '16/9': '16 / 9',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
