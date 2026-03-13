const PRIMARY = "#00C9A7";
const PRIMARY_DARK = "#00A88D";
const ACCENT = "#0EA5E9";
const DANGER = "#EF4444";
const WARNING = "#F59E0B";
const SUCCESS = "#22C55E";

export default {
  light: {
    text: "#F0F4F8",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    background: "#060E1A",
    backgroundSecondary: "#0D1B2A",
    backgroundCard: "#111D2E",
    backgroundInput: "#0D1B2A",
    tint: PRIMARY,
    tintDark: PRIMARY_DARK,
    accent: ACCENT,
    danger: DANGER,
    warning: WARNING,
    success: SUCCESS,
    border: "#1E2D3D",
    borderLight: "#243447",
    tabIconDefault: "#334155",
    tabIconSelected: PRIMARY,
    shadow: "rgba(0, 201, 167, 0.15)",
  },
};

export type ColorTheme = typeof import("./colors").default.light;
