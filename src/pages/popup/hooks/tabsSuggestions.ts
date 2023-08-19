import browser from "~/browser";

import { createLazyResource, matchCommand, setInput } from "../signals";
import { Command } from "./commandsSuggestions";
import niceUrl from "./niceUrl";

const KEYWORD = "t";

const commands = createLazyResource<Command[]>([], async () => {
  const allTabs = await browser.tabs.query({});
  return allTabs.map(({ title, url, id, windowId }) => {
    url ||= "";
    return {
      title: title || "Untitled",
      subtitle: niceUrl(url),
      icon: url,
      command: () => {
        browser.tabs.update(id, { highlighted: true });
        browser.windows.update(windowId!, { focused: true });
        window.close();
      },
    } satisfies Command;
  });
});

const base: Command[] = [
  {
    title: "Search Tabs",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
    icon: "about:blank",
  },
];

export default function switchTabSuggestions(): Command[] {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
