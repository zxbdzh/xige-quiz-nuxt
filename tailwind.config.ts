import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
          soft: 'var(--brand-soft)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
        },
        bg: {
          DEFAULT: 'var(--bg)',
          elev: 'var(--bg-elev)',
          'elev-2': 'var(--bg-elev-2)',
          'elev-3': 'var(--bg-elev-3)',
        },
        fg: {
          DEFAULT: 'var(--fg)',
          mute: 'var(--fg-mute)',
          faint: 'var(--fg-faint)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        ok: {
          DEFAULT: 'var(--ok)',
          soft: 'var(--ok-soft)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          soft: 'var(--warn-soft)',
        },
        err: {
          DEFAULT: 'var(--err)',
          soft: 'var(--err-soft)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        // 8-pt rhythm
        'overline': ['11px', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '600' }],
        'caption': ['13px', { lineHeight: '1.5', fontWeight: '500' }],
        'body': ['15px', { lineHeight: '1.65' }],
        'h3': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'h2': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'h1': ['28px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display': ['36px', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.025em' }],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '10px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        brand: 'var(--shadow-brand)',
        accent: 'var(--shadow-accent)',
      },
      ringColor: {
        brand: 'var(--brand-ring)',
      },
    },
  },
}
