export const THEMES = ["light", "dark", "paper", "midnight", "forest"] as const;

export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  paper: "Paper",
  midnight: "Midnight",
  forest: "Forest",
};

export const THEME_SWATCHES: Record<Theme, { bg: string; accent: string }> = {
  light: { bg: "#F7F6F2", accent: "#C1633A" },
  dark: { bg: "#171513", accent: "#E2955F" },
  paper: { bg: "#F4ECDA", accent: "#B2542E" },
  midnight: { bg: "#0D1220", accent: "#E3A458" },
  forest: { bg: "#EDF1E6", accent: "#A9622F" },
};

export const THEME_STORAGE_KEY = "journal-theme";

export function isTheme(value: string | null): value is Theme {
  return !!value && (THEMES as readonly string[]).includes(value);
}

// Inlined into a beforeInteractive <script> in the root layout so the
// correct theme is applied before first paint (no flash).
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var stored = localStorage.getItem(key);
    var valid = ${JSON.stringify(THEMES)};
    var theme = valid.indexOf(stored) !== -1 ? stored : null;
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      localStorage.setItem(key, theme);
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;
