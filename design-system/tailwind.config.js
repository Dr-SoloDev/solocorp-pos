/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.html', './**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      /* ─── Color System: Industrial Modern ─── */
      colors: {
        /* Primary Blue */
        primary: {
          DEFAULT: '#1A56DB',
          dark: '#1243AF',
          light: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1A56DB',
          800: '#1E40AF',
          900: '#1E3A8A',
        },

        /* Steel Neutral (Industrial) */
        steel: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        /* Condition Colors (POS-specific) */
        condition: {
          good: '#059669',
          'good-light': '#D1FAE5',
          fair: '#D97706',
          'fair-light': '#FEF3C7',
          poor: '#DC2626',
          'poor-light': '#FEE2E2',
        },

        /* Semantic Overrides */
        success: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        info: {
          DEFAULT: '#0284C7',
          light: '#E0F2FE',
        },

        /* Dark Mode Surface (Future) */
        dark: {
          bg: '#1A1B1E',
          surface: '#2A2B2E',
          border: '#3A3B3E',
          text: '#E5E7EB',
        },
      },

      /* ─── Typography ─── */
      fontFamily: {
        sans: ['Inter', 'Sarabun', 'system-ui', '-apple-system', 'sans-serif'],
        thai: ['Sarabun', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        'fine': ['0.625rem', { lineHeight: '0.875rem' }],     // 10px
        'caption': ['0.75rem', { lineHeight: '1rem' }],        // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],         // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],            // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],         // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],          // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],             // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],        // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],          // 36px
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },

      /* ─── Spacing (4px grid) ─── */
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },

      /* ─── Border Radius ─── */
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
      },

      /* ─── Shadows (Industrial) ─── */
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 2px 6px rgba(0,0,0,0.12)',
        'dropdown': '0 4px 12px rgba(0,0,0,0.12)',
        'modal': '0 8px 24px rgba(0,0,0,0.16)',
        'button': '0 1px 2px rgba(0,0,0,0.06)',
        'inner-heavy': 'inset 0 2px 4px rgba(0,0,0,0.06)',
      },

      /* ─── Widths & Heights ─── */
      minHeight: {
        'touch': '44px',     // Minimum touch target
        'input': '40px',     // Input field height
        'button': '44px',    // Button height
      },
      minWidth: {
        'touch': '44px',
      },

      /* ─── Z-Index Scale ─── */
      zIndex: {
        'dropdown': 50,
        'sticky': 60,
        'nav': 70,
        'drawer': 80,
        'modal': 90,
        'toast': 100,
      },

      /* ─── Animation ─── */
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      /* ─── Transition ─── */
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
