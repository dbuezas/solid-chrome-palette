const KEYWORD = "h";

import { formatDistanceToNow } from "date-fns";
import browser from "webextension-polyfill";
import { createLazyResource, matchCommand, setInput } from "../signals";
import niceUrl from "./niceUrl";

export function isDefined<T>(a: T | null): a is T {
  return Boolean(a);
}
const commands = createLazyResource([], async () => {
  let list = [];
  const history = await browser.history.search({
    text: "",
    startTime: 0,
    maxResults: 10000,
  }); // fetch all
  list = history
    .map(({ url, title, lastVisitTime }) => {
      if (!url) return null;
      return {
        name: `${title}\n${niceUrl(url)}`,
        category: "History",
        // keyword: url.slice(0, 100),
        timeAgo: formatDistanceToNow(lastVisitTime || 0),
        icon: url,
        command: async function () {
          await browser.tabs.create({ url });
        },
      };
    })
    .filter(isDefined);
  return list;
});

const base = [
  {
    name: "Search History",
    category: "Search",
    icon: "chrome://history/",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
    shortcut: "todo",
  },
];
export function historySuggestions() {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
