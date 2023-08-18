const KEYWORD = "b";

import { formatDistanceToNow } from "date-fns";
import browser from "~/browser";
import { createLazyResource, matchCommand, setInput } from "../signals";
import { Command } from "./commandsSuggestions";
import niceUrl from "./niceUrl";

const traverse = (
  nodes: browser.Bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): (Command & { dateAdded: number })[] => {
  return nodes.flatMap(({ children, url, title, dateAdded }) => {
    const path = breadcrumb ? breadcrumb + "/" + title : title;
    if (children) {
      return traverse(children, path);
    }
    url ||= "";
    return {
      name: `${title} > ${breadcrumb}\n${niceUrl(url)}`,
      icon: "chrome://favicon/" + url,
      category: "Bookmark",
      dateAdded: dateAdded || 0,
      timeAgo: dateAdded
        ? formatDistanceToNow(new Date(dateAdded || 0))
        : undefined,
      command: async function () {
        await browser.tabs.create({ url });
      },
    };
  });
  // .sort((a, b) => b.dateAdded - a.dateAdded);
};
const commands = createLazyResource([], async () => {
  ("fetching bookmarks");
  const root = await browser.bookmarks.getTree();
  return traverse(root);
});

const base = [
  {
    name: "Bookmarked Tabs",
    category: "Search",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];
export function bookmarkSuggestions() {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
