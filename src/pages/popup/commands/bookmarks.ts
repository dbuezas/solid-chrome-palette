import browser from "~/util/browser";
import niceUrl from "~/util/nice-url";
import { createLazyResource, matchCommand, setInput } from "~/util/signals";

import { Command } from "./general";

const KEYWORD = "b";

const traverse = (
  nodes: browser.Bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): Command[] => {
  return nodes.flatMap(({ children, url, title, dateAdded }) => {
    const path = breadcrumb ? breadcrumb + "/" + title : title;
    if (children) {
      return traverse(children, path);
    }
    url ||= "";
    return {
      title: `${title} > ${breadcrumb}`,
      subtitle: niceUrl(url),
      icon: "chrome://favicon/" + url,
      lastVisitTime: dateAdded,
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

const base: Command[] = [
  {
    title: "Bookmarked Tabs",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];
export default function bookmarkSuggestions(): Command[] {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
