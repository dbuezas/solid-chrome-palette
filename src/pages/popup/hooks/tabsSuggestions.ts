import browser from "~/browser";

import { createLazyResource, matchCommand, setInput } from "../signals";
import { Command } from "./commandsSuggestions";
import niceUrl from "./niceUrl";

const KEYWORD = "t";

const commands = createLazyResource([], async () => {
  const allTabs = await browser.tabs.query({});
  return allTabs.map(({ title, url, id, windowId }) => {
    url ||= "";
    return {
      name: `${title}\n${niceUrl(url)}`,
      icon: url,
      category: "Tab",
      command: () => {
        browser.tabs.update(id, { highlighted: true });
        browser.windows.update(windowId!, { focused: true });
        window.close();
      },
    } satisfies Command;
  });
});

const base = [
  {
    name: "Search Tabs",
    category: "Search",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
    icon: "about:blank",
  },
];

export function switchTabSuggestions() {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
