/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#eff6ff',
  				'100': '#dbeafe',
  				'200': '#bfdbfe',
  				'300': '#93c5fd',
  				'400': '#60a5fa',
  				'500': '#3b82f6',
  				'600': '#2563eb',
  				'700': '#1d4ed8',
  				'800': '#1e40af',
  				'900': '#1e3a8a',
  				'950': '#0c2d6b',
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				'50': '#f8fafc',
  				'100': '#f1f5f9',
  				'200': '#e2e8f0',
  				'300': '#cbd5e1',
  				'400': '#94a3b8',
  				'500': '#64748b',
  				'600': '#475569',
  				'700': '#334155',
  				'800': '#1e293b',
  				'900': '#0f172a',
  				'950': '#020617',
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			accent: {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				'200': '#bae6fd',
  				'300': '#7dd3fc',
  				'400': '#38bdf8',
  				'500': '#0ea5e9',
  				'600': '#0284c7',
  				'700': '#0369a1',
  				'800': '#075985',
  				'900': '#0c4a6e',
  				'950': '#051e3e',
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			blue: {
  				'50': '#caf0f8',
  				'100': '#ade8f4',
  				'200': '#90e0ef',
  				'300': '#48cae4',
  				'400': '#00b4d8',
  				'500': '#0096c7',
  				'600': '#0077b6',
  				'700': '#023e8a',
  				'800': '#03045e',
  				'900': '#030449',
  				cyan: '#caf0f8',
  				'sky-blue': '#48cae4',
  				'pacific': '#00b4d8',
  				'honolulu': '#0077b6',
  				'marian': '#023e8a',
  				'federal': '#03045e'
  			},
  			success: {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#22c55e',
  				'600': '#16a34a',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#145231'
  			},
  			warning: {
  				'50': '#fef3c7',
  				'100': '#fde68a',
  				'200': '#fcd34d',
  				'300': '#fbbf24',
  				'400': '#f59e0b',
  				'500': '#d97706',
  				'600': '#b45309',
  				'700': '#92400e',
  				'800': '#78350f',
  				'900': '#451a03'
  			},
  			danger: {
  				'50': '#fef2f2',
  				'100': '#fee2e2',
  				'200': '#fecaca',
  				'300': '#fca5a5',
  				'400': '#f87171',
  				'500': '#ef4444',
  				'600': '#dc2626',
  				'700': '#b91c1c',
  				'800': '#991b1b',
  				'900': '#7f1d1d'
  			},
  			info: {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				'200': '#bae6fd',
  				'300': '#7dd3fc',
  				'400': '#38bdf8',
  				'500': '#0ea5e9',
  				'600': '#0284c7',
  				'700': '#0369a1',
  				'800': '#075985',
  				'900': '#0c4a6e'
  			},
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			}
  		},
  		fontSize: {
  			display: [
  				'3.5rem',
  				{
  					lineHeight: '1.25',
  					fontWeight: '700'
  				}
  			],
  			h1: [
  				'2.25rem',
  				{
  					lineHeight: '1.25',
  					fontWeight: '700'
  				}
  			],
  			h2: [
  				'1.875rem',
  				{
  					lineHeight: '1.25',
  					fontWeight: '700'
  				}
  			],
  			h3: [
  				'1.5rem',
  				{
  					lineHeight: '1.25',
  					fontWeight: '600'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '500'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '400'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '400'
  				}
  			],
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1',
  					fontWeight: '500'
  				}
  			]
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			],
  			display: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'Fira Code"',
  				'Courier New',
  				'monospace'
  			]
  		},
  		fontWeight: {
  			light: '300',
  			normal: '400',
  			medium: '500',
  			semibold: '600',
  			bold: '700'
  		},
  		spacing: {
  			xs: '4px',
  			sm: '8px',
  			md: '16px',
  			lg: '24px',
  			xl: '32px',
  			'2xl': '48px',
  			'3xl': '64px',
  			'4xl': '96px'
  		},
  		boxShadow: {
  			none: 'none',
  			subtle: '0 1px 2px rgba(0, 0, 0, 0.04)',
  			sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  			base: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  			md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  			lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  			xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04)',
  			'2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
  			inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
  			'dual-sm': '0 1px 2px rgba(255, 255, 255, 0.15) inset, 0 1px 3px rgba(0, 0, 0, 0.2)',
  			'dual-md': '0 2px 4px rgba(255, 255, 255, 0.1) inset, 0 4px 8px rgba(0, 0, 0, 0.2)',
  			'dual-lg': '0 4px 8px rgba(255, 255, 255, 0.1) inset, 0 8px 16px rgba(0, 0, 0, 0.25)',
  			'dual-xl': '0 6px 12px rgba(255, 255, 255, 0.1) inset, 0 12px 24px rgba(0, 0, 0, 0.3)'
  		},
  		borderRadius: {
  			subtle: '4px',
  			sm: 'calc(var(--radius) - 4px)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			full: '9999px'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-in-out',
  			'fade-out': 'fadeOut 0.3s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'slide-down': 'slideDown 0.3s ease-out',
  			'slide-in-right': 'slideInRight 0.3s ease-out',
  			'slide-out-right': 'slideOutRight 0.3s ease-out',
  			'scale-in': 'scaleIn 0.3s ease-out',
  			'scale-out': 'scaleOut 0.3s ease-out',
  			'bounce-in': 'bounceIn 0.5s ease-out',
  			'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			fadeOut: {
  				'0%': {
  					opacity: '1'
  				},
  				'100%': {
  					opacity: '0'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(12px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideDown: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-12px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideInRight: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(100%)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			slideOutRight: {
  				'0%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				},
  				'100%': {
  					opacity: '0',
  					transform: 'translateX(100%)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			scaleOut: {
  				'0%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				},
  				'100%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				}
  			},
  			bounceIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.3)'
  				},
  				'50%': {
  					opacity: '1',
  					transform: 'scale(1.05)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			pulseSubtle: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.5'
  				}
  			}
  		},
  		transitionDuration: {
  			fast: '150ms',
  			normal: '200ms',
  			slow: '300ms',
  			slower: '500ms'
  		},
  		transitionTimingFunction: {
  			'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
  			'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  		},
  		lineHeight: {
  			tight: '1.25',
  			normal: '1.5',
  			relaxed: '1.75',
  			loose: '2'
  		},
  		zIndex: {
  			'0': '0',
  			'10': '10',
  			'20': '20',
  			'30': '30',
  			'40': '40',
  			'50': '50',
  			'75': '75',
  			'100': '100',
  			auto: 'auto',
  			hide: '-1',
  			dropdown: '1000',
  			sticky: '1020',
  			fixed: '1030',
  			modal: '1040',
  			popover: '1050',
  			tooltip: '1060'
  		}
  	}
  },

  plugins: [require('@tailwindcss/forms'), require("tailwindcss-animate")],
};
