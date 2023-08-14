const KEYWORD = "bt";
import { formatDistanceToNow } from "date-fns";
import browser from "webextension-polyfill";
import { createLazyResource, matchCommand, setInput } from "../signals";
import { Command } from "./commandsSuggestions";

const traverse = (
  nodes: browser.Bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): Command[] => {
  return nodes.flatMap(({ id, children, url, title, dateAdded }) => {
    const path = breadcrumb ? breadcrumb + " / " + title : title;
    const list: Command[] = [];
    if (!url && path !== "") {
      list.push({
        name: path,
        icon: "chrome://favicon/",
        category: "Add Bookmark",
        timeAgo:
          dateAdded !== 0
            ? undefined
            : formatDistanceToNow(new Date(dateAdded || 0)),
        command: async function () {
          const [tab] = await browser.tabs.query({
            currentWindow: true,
            active: true,
          });
          await browser.bookmarks.create({
            index: 0,
            url: tab.url,
            title: tab.title,
            parentId: id,
          });
          window.close();
        },
      });
    }
    if (children) {
      list.push(...traverse(children, path));
    }
    return list;
  });
};

const base = [
  {
    name: "Bookmark this tab",
    category: "Add Bookmark",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];

const commands = createLazyResource([], async () => {
  const root = await browser.bookmarks.getTree();
  return traverse(root);
});

export function bookmarkThisSuggestions() {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
