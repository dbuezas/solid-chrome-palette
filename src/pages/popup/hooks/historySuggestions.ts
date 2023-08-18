const KEYWORD = "h";

import { formatDistanceToNow } from "date-fns";
import browser from "~/browser";
import { createLazyResource, matchCommand, setInput } from "../signals";
import { Command } from "./commandsSuggestions";
import niceUrl from "./niceUrl";

export function isDefined<T>(a: T | null): a is T {
  return Boolean(a);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const commands = createLazyResource<Command[]>([], async (setVal) => {
  let list: Command[] = [];
  Promise.resolve().then(async () => {
    let endTime = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    let done = false;
    // const MAX = 10000;
    const MAX = Number.POSITIVE_INFINITY;
    while (!done) {
      const startTime = endTime - ONE_DAY;
      const history = await browser.history.search({
        text: "",
        startTime,
        endTime,
        maxResults: 1000,
      }); // fetch all
      const more = history
        .map(({ url, title, lastVisitTime }) => {
          if (!url) return null;
          return {
            name: `${title || "Untitled"}\n${niceUrl(url)}`,
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
      list = [...list, ...more];
      setVal(list);
      console.log({ startTime, endTime, l: list.length });
      endTime = startTime;
      done = history.length === 0 || list.length > MAX;
      await sleep(10);
    }
  });
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
