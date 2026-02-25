import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';

export const Colors = {
  light: {
    textWhite: '#ffffff',
    textLight: '#e6d3ab',
    textDark: '#a89575',
    background: '#244937',
    button: '#416d5e',
    buttonBorder: '#699788',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  }
};

export const Fonts = Platform.select({
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
