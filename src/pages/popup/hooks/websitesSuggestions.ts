import browser from "webextension-polyfill";
import { matchCommand, parsedInput, setInput } from "../signals";

type Template = {
  name: string;
  url: (query: string) => string;
  keyword: string;
};
const templates: Template[] = [
  {
    name: "Google Drive",
    url: (query) => `https://drive.google.com/drive/search?q=${query}`,
    keyword: "gd",
  },
  {
    name: "Youtube",
    url: (query) => `https://www.youtube.com/results?search_query=${query}`,
    keyword: "y",
  },
  {
    name: "Google",
    url: (query) => `https://www.google.com/search?q=${query}`,
    keyword: "g",
  },
  {
    name: "Wikipedia",
    url: (query) => `https://en.wikipedia.org/w/index.php?search=${query}`,
    keyword: "w",
  },
];

const base = templates.map((template) => ({
  name: `Search ${template.name}`,
  category: "Search",
  command: async function () {
    setInput(template.keyword + ">");
  },
  keyword: template.keyword + ">",
  shortcut: "todo",
}));

export function websitesSuggestions() {
  for (const template of templates) {
    const { isMatch, query } = matchCommand(template.keyword);
    if (isMatch)
      return [
        {
          name: `Search ${template.name}: ${query}`,
          category: "Search",
          command: async function () {
            await browser.tabs.create({
              url: template.url(query),
            });
          },
        },
      ];
  }

  const { isCommand } = parsedInput();
  if (isCommand) return [];
  return base;
}
