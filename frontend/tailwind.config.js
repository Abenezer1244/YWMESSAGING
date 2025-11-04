/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			success: {
  				DEFAULT: 'var(--success, #22c55e)',
  				foreground: 'var(--success-foreground, #fff)'
  			},
  			warning: {
  				DEFAULT: 'var(--warning, #f59e0b)',
  				foreground: 'var(--warning-foreground, #fff)'
  			},
  			danger: {
  				DEFAULT: 'var(--danger, #ef4444)',
  				foreground: 'var(--danger-foreground, #fff)'
  			},
  			info: {
  				DEFAULT: 'var(--info, #0ea5e9)',
  				foreground: 'var(--info-foreground, #fff)'
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
  			sans: 'var(--font-sans)',
  			serif: 'var(--font-serif)',
  			mono: 'var(--font-mono)'
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
