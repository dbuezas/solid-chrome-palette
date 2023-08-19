// adapted from https://github.com/ssundarraj/commander/blob/master/src/js/actions.js
import browser from "~/browser";

import { resetHistory } from "../last-used";
import { inputSignal, parsedInput } from "../signals";

export type Command = {
  title: string;
  subtitle?: string;
  shortcut?: string;
  lastVisitTime?: number;
  keyword?: string;
  command: Function;
  icon?: string;
};
const [, setInputValue] = inputSignal;

const base: Command[] = [
  {
    title: "New Tab",
    shortcut: "⌘ t",
    command: async function () {
      await browser.tabs.create({});
    },
  },
  {
    title: "New Window",
    shortcut: "⌘ n",
    command: async function () {
      await browser.windows.create({});
    },
  },
  {
    title: "Open History Page",
    shortcut: "⌘ y",
    command: async function () {
      await browser.tabs.create({ url: "chrome://history" });
    },
  },
  {
    title: "Open Passwords Page",
    command: async function () {
      await browser.tabs.create({ url: "chrome://settings/passwords" });
    },
  },
  {
    title: "Open Downloads",
    shortcut: "⌘⇧ d",
    command: async function () {
      await browser.tabs.create({ url: "chrome://downloads" });
    },
  },
  {
    title: "Open Extensions",
    command: async function () {
      await browser.tabs.create({ url: "chrome://extensions" });
    },
  },
  {
    title: "Open Extension Shortcuts",
    command: async function () {
      await browser.tabs.create({ url: "chrome://extensions/shortcuts" });
    },
  },
  {
    title: "Open Bookmark Manager",
    shortcut: "⌘⌥ b",
    command: async function () {
      await browser.tabs.create({ url: "chrome://bookmarks" });
    },
  },
  {
    title: "Show/hide Bookmarks Bar",
    shortcut: "⌘⇧ b",
    command: async function () {
      setInputValue("Unsupported. Use [⌘⇧ b] instead.");
    },
  },
  {
    title: "Open Settings",
    shortcut: "⌘ ,",
    command: async function () {
      await browser.tabs.create({ url: "chrome://settings" });
    },
  },
  {
    title: "Close Current Tab",
    shortcut: "⌘ w",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      await browser.tabs.remove(currentTab.id!);
    },
  },
  // {
  //   title: "Terminate Current Tab",
  //   command: async function () {
  //     const windowId = chrome.windows.WINDOW_ID_CURRENT;
  //     console.log(browser);
  //     const [currentTab] = await browser.tabs.query({
  //       active: true,
  //       windowId,
  //     });
  //     debugger;
  //     const processId = await browser.processes.getProcessIdForTab(
  //       currentTab.id!
  //     );

  //     await browser.processes.terminate(processId);
  //   },
  // },
  {
    title: "Reload Tab",
    shortcut: "⌘ r",
    command: async function () {
      await browser.tabs.reload();
      window.close();
    },
  },
  {
    title: "Reload All Tabs",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const allTabs = await browser.tabs.query({ windowId });
      for (const tab of allTabs) {
        await browser.tabs.reload(tab.id);
      }
      window.close();
    },
  },
  {
    title: "Clear Cache and Reload Tab",
    shortcut: "⌘⇧ r",
    command: async function () {
      await browser.tabs.reload(undefined, { bypassCache: true });
      window.close();
    },
  },
  {
    title: "Toggle Pin",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      await browser.tabs.update({ pinned: !currentTab.pinned });
      window.close();
    },
  },
  {
    title: "Duplicate Tab",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      await browser.tabs.duplicate(currentTab.id!);
    },
  },
  {
    title: "New Incognito Window",
    shortcut: "⌘⇧ n",
    command: async function () {
      await browser.windows.create({ incognito: true });
    },
  },
  {
    title: "Close Other Tabs",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const otherTabs = await browser.tabs.query({
        active: false,
        windowId,
      });
      const otherTabIds = otherTabs.map(({ id }) => id!);
      await browser.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    title: "Close Tabs To Right",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      const otherTabs = await browser.tabs.query({
        active: false,
        windowId,
      });
      const otherTabIds = otherTabs
        .filter((tab) => tab.index > currentTab.index)
        .map(({ id }) => id!);
      await browser.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    title: "Close Tabs To Left",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      const otherTabs = await browser.tabs.query({
        active: false,
        windowId,
      });
      const otherTabIds = otherTabs
        .filter((tab) => tab.index < currentTab.index)
        .map(({ id }) => id!);
      await browser.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    title: "Mute/Unmute Tab",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      const isMuted = currentTab.mutedInfo!.muted;
      await browser.tabs.update({ muted: !isMuted });
      window.close();
    },
  },
  {
    title: "Move Tab To Start",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      await browser.tabs.move(currentTab.id!, { index: 0 });
      window.close();
    },
  },
  {
    title: "Move Tab To End",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      await browser.tabs.move(currentTab.id!, { index: -1 });
      window.close();
    },
  },
  {
    title: "Move Tab Left",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      await browser.tabs.move(currentTab.id!, {
        index: currentTab.index - 1,
      });
      window.close();
    },
  },
  {
    title: "Move Tab Right",
    command: async function () {
      const windowId = browser.windows.WINDOW_ID_CURRENT;
      const [currentTab] = await browser.tabs.query({
        active: true,
        windowId,
      });
      await browser.tabs.move(currentTab.id!, {
        index: currentTab.index + 1,
      });
      window.close();
    },
  },
  {
    title: "Reopen/Unclose Tab",
    shortcut: "⌘⇧ t",
    command: async function () {
      return await browser.sessions.restore();
    },
  },
  {
    title: "Deattach Tab (Move to New Window)",
    command: async function () {
      const [tab] = await browser.tabs.query({
        currentWindow: true,
        active: true,
      });
      await browser.windows.create({ tabId: tab.id });
    },
  },
  {
    title: "Reattach Tab (Move Tab to Previous Window)",
    command: async function () {
      const [currentTab] = await browser.tabs.query({
        currentWindow: true,
        active: true,
      });
      const currentWindow = await browser.windows.getCurrent({
        // windowTypes: ["normal"],
      });
      const allWindows = await browser.windows.getAll({
        windowTypes: ["normal"],
      });
      const otherWindows = allWindows.filter(
        (win) => win.id !== currentWindow.id
      );
      const prevWindow = otherWindows[0];
      await browser.windows.update(prevWindow.id!, { focused: true });
      await browser.tabs.move(currentTab.id!, {
        windowId: prevWindow.id,
        index: -1,
      });
      await browser.tabs.update(currentTab.id!, { highlighted: true });
    },
  },
  {
    title: "Toggle full screen",
    shortcut: "⌃⌘ f",
    command: async function () {
      const currWindow = await browser.windows.getCurrent();
      const state = currWindow.state === "fullscreen" ? "normal" : "fullscreen";
      browser.windows.update(currWindow.id!, {
        state,
      });
      window.close();
    },
  },
  {
    title: "Reset command history",
    command: async function () {
      setTimeout(() => {
        // otherwise this command will be stored
        resetHistory();
        window.location.reload();
      }, 0);
    },
  },
];

if (process.env.NODE_ENV !== "production") {
  base.push({
    title: "Throw error",
    command: async function () {
      throw new Error("on purpose");
    },
  });
}

export default function useCommandSuggestions(): Command[] {
  const { isCommand } = parsedInput();
  if (isCommand) return [];
  return base;
}
