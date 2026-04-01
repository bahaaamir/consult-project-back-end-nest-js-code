import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Consult OS — Custom PrimeNG Preset
 *
 * Extends the Aura preset with the Consult brand identity:
 *   • Primary  → Sky blue (#0ea5e9)
 *   • Surfaces → Slate scale
 *   • Font     → Saira
 *
 * All PrimeNG components automatically pick up these tokens.
 * Custom SCSS uses bridge variables (--app-*) defined in _tokens.scss.
 */
export const ConsultPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
  },

  semantic: {
    /* ── Brand palette ── */
    primary: {
      50:  '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },

    /* ── Global semantic tokens ── */
    transitionDuration: '0.2s',
    focusRing: {
      width: '1px',
      style: 'solid',
      color: '{primary.color}',
      offset: '2px',
      shadow: 'none',
    },

    /* ── Color schemes ── */
    colorScheme: {
      light: {
        primary: {
          color:         '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor:    '{primary.600}',
          activeColor:   '{primary.700}',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        formField: {
          hoverBorderColor: '{surface.400}',
        },
      },
      dark: {
        primary: {
          color:         '{primary.400}',
          contrastColor: '{surface.900}',
          hoverColor:    '{primary.300}',
          activeColor:   '{primary.200}',
        },
        surface: {
          0:   '#ffffff',
          50:  '#fafafa',
          100: '#27272a',
          200: '#3f3f46',
          300: '#52525b',
          400: '#71717a',
          500: '#a1a1aa',
          600: '#d4d4d8',
          700: '#e4e4e7',
          800: '#f4f4f5',
          900: '#0b1220',
          950: '#0f1a2e',
        },
        formField: {
          hoverBorderColor: '{surface.500}',
        },
      },
    },
  },

});
