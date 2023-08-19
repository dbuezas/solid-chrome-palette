import { createEffect, createMemo, createSignal } from "solid-js";

import { createStoredSignal, matchCommand, setInput } from "../signals";

const KEYWORD = "theme";

const THEMES = ["Default", "Dark", "Light", "Github"] as const;
type Theme = (typeof THEMES)[number];

const getOsTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Light";
const [osTheme, setOsTheme] = createSignal(getOsTheme());

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", function (e) {
    setOsTheme(getOsTheme());
  });

const [themeConfig, setThemeConfig] = createStoredSignal<Theme>(
  "theme",
  "Default"
);

export const theme = createMemo(() => {
  if (themeConfig() === "Default") return osTheme();
  return themeConfig();
});

createEffect(() => {
  document.body.setAttribute("theme", theme());
});

const commands = () =>
  THEMES.map((aTheme) => ({
    name: `${aTheme} ${themeConfig() == aTheme ? "\nSelected" : ""}`,
    category: "Theme",
    command: async function () {
      setThemeConfig(aTheme);
    },
  }));

const base = [
  {
    name: "Chrome Palette Themes",
    category: "Theme",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];

export function themeSuggestions() {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
