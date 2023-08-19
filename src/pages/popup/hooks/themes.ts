import { createEffect, createMemo, createSignal } from "solid-js";

import { createStoredSignal, matchCommand, setInput } from "../signals";
import { Command } from "./commandsSuggestions";

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

const commands = (): Command[] =>
  THEMES.map((aTheme) => ({
    title: aTheme,
    subtitle: themeConfig() == aTheme ? "\nSelected" : "",
    command: async function () {
      setThemeConfig(aTheme);
    },
  }));

const base: Command[] = [
  {
    title: "Chrome Palette Themes",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];

export default function themeSuggestions(): Command[] {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
