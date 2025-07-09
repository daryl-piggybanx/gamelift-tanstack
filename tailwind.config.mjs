/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			arial: [
  				'Arial',
  				'Helvetica',
  				'sans-serif'
  			]
  		},
  		colors: {
  			'app-bg': '#313033',
  			'blue-primary': '#539FE5',
  			'blue-secondary': '#424650',
  			'gray-primary': '#666666',
  			'red-primary': '#701F1F',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		zIndex: {
  			'9999': '9999',
  			'30000': '30000',
  			'99999': '99999'
  		},
  		animation: {
  			'spin-slow': 'spin 2s linear infinite',
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'connecting-pulse': 'connectingColorPulse 1s linear alternate-reverse infinite'
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
  			connectingColorPulse: {
  				to: {
  					backgroundColor: '#058'
  				}
  			}
  		},
  		dropShadow: {
  			'virtual-control': [
  				'0 0 2px rgba(84, 84, 84, 0.3)',
  				'0 0 4px rgba(110, 110, 110, 0.5)'
  			],
  			'virtual-control-pressed': [
  				'0 0 8px rgba(112, 112, 112, 0.8)',
  				'0 0 12px rgba(101, 101, 101, 0.6)',
  				'0 0 16px rgba(78, 78, 78, 0.4)'
  			]
  		},
  		aspectRatio: {
  			'16/9': '16 / 9'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.virtual-controls-container': {
          position: 'fixed',
          top: '100px',
          padding: '10px',
          borderRadius: '4px',
          zIndex: '30000',
          pointerEvents: 'auto',
        },
        '.stream-fullscreen-container': {
          position: 'fixed',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '2',
        },
        '.stream-fullscreen-container-mobile': {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
        },
        '.virtual-button-pressed': {
          transform: 'scale(0.95)',
          opacity: '0.5',
        },
        '.touch-block-overlay': {
          pointerEvents: 'auto !important',
          zIndex: '2',
        },
        '.hamburger-menu': {
          position: 'fixed',
          top: '15px',
          right: '15px',
          width: '44px',
          height: '44px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          cursor: 'pointer',
          zIndex: '999999',
          borderRadius: '4px',
          WebkitTapHighlightColor: 'transparent',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          transition: 'background-color 0.3s ease',
        },
        '.hamburger-menu:active': {
          backgroundColor: 'rgba(69, 160, 73, 0.8)',
        },
        '@media (hover: hover)': {
          '.hamburger-menu:hover': {
            backgroundColor: 'rgba(69, 160, 73, 0.8)',
          },
        },
        // Orientation styles
        '@media screen and (orientation: portrait) and (max-width: 768px)': {
          '.landscape-forced': {
            transform: 'rotate(-90deg)',
            transformOrigin: 'left top',
            width: '100vh',
            height: '100vw',
            overflow: 'hidden',
            position: 'absolute',
            top: '100%',
            left: '0',
          },
          '.virtual-controls-portrait': {
            transform: 'rotate(90deg)',
            transformOrigin: 'bottom left',
            width: '100vh',
            height: '100vw',
            top: '100%',
            left: '0',
          },
        },
        // Loading screen styles
        '.loading-spinner': {
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #ffaa00',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto',
        },
        // Widget and modal styles
        '.modal-container': {
          width: '512px',
          height: '256px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #ffffff',
          borderRadius: '15px',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        },
        '.advanced-overlay': {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#313033',
          color: '#ffffff',
          padding: '20px',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
          zIndex: '1001',
          borderRadius: '15px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '12pt',
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflowY: 'auto',
          width: 'fit-content',
        },
        // Button styles
        '.metric-button': {
          border: '2px solid #ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          color: '#ffffff',
          transition: 'all 0.3s ease',
          padding: '.25em 1em',
          fontSize: '130%',
          borderRadius: '15px',
          cursor: 'pointer',
        },
        '.metric-button:hover, .metric-button:active': {
          backgroundColor: '#ffffff',
          color: '#000000',
        },
        // Stats and metrics styles
        '.webrtc-stats': {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#000000b3',
          width: '95vw',
          maxWidth: '2000px',
          maxHeight: '98vh',
          overflowY: 'auto',
          padding: '10px',
          borderRadius: '15px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.stat-section': {
          backgroundColor: '#2c2c2c',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          boxSizing: 'border-box',
          overflow: 'auto',
        },
      };
      
      addUtilities(newUtilities);
    },
      require("tailwindcss-animate")
],
}
