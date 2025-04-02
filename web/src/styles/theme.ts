import { MantineThemeOverride } from '@mantine/core';

export const appTheme: MantineThemeOverride = {
  colors: {
    brand: [
      '#e6f7ff', // 0
      '#bae7ff', // 1
      '#91d5ff', // 2
      '#69c0ff', // 3
      '#40a9ff', // 4
      '#1890ff', // 5
      '#096dd9', // 6
      '#0050b3', // 7
      '#003a8c', // 8
      '#002766', // 9
    ],
  },
  primaryColor: 'blue',
  defaultRadius: '4px',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  components: {
    Button: {
      defaultProps: {
        radius: '4px',
      },
    },
    Card: {
      defaultProps: {
        radius: '4px',
      },
    },
    Paper: {
      defaultProps: {
        radius: '4px',
      },
    },
  },
  other: {
    contentPadding: {
      xs: '1rem',
      sm: '1.5rem',
      md: '2rem',
    },
    borderColors: {
      light: '#e9ecef',
      default: '#dee2e6',
      dark: '#adb5bd',
    },
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
};