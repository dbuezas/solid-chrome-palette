// adapted from https://github.com/ssundarraj/commander/blob/master/src/js/actions.js
import { resetHistory } from "~/util/last-used";
import { inputSignal, parsedInput } from "~/util/signals";

import { isTruthy } from "../util/isTruthy";

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

const getActiveTab = async () => {
  const windowId = chrome.windows.WINDOW_ID_CURRENT;
  const [currentTab] = await chrome.tabs.query({
    active: true,
    windowId,
  });
  return currentTab;
};
const base: Command[] = [
  {
    title: "New Tab",
    shortcut: "⌘ t",
    command: async function () {
      await chrome.tabs.create({});
    },
  },
  {
    title: "New Window",
    shortcut: "⌘ n",
    command: async function () {
      await chrome.windows.create({});
    },
  },
  {
    title: "Open History Page",
    shortcut: "⌘ y",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://history" });
    },
  },
  {
    title: "Open Passwords Page",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/passwords" });
    },
  },
  {
    title: "Open Downloads",
    shortcut: "⌘⇧ d",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://downloads" });
    },
  },
  {
    title: "Open Extensions",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://extensions" });
    },
  },
  {
    title: "Open Extension Shortcuts",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    },
  },
  {
    title: "Open Bookmark Manager",
    shortcut: "⌘⌥ b",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://bookmarks" });
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
      await chrome.tabs.create({ url: "chrome://settings" });
    },
  },
  {
    title: "Close Current Tab",
    shortcut: "⌘ w",
    command: async function () {
      const currentTab = await getActiveTab();
      await chrome.tabs.remove(currentTab.id!);
    },
  },
  // {
  //   title: "Terminate Current Tab",
  //   command: async function () {
  //     const windowId = chrome.windows.WINDOW_ID_CURRENT;
  //     console.log(chrome);
  //     const [currentTab] = await chrome.tabs.query({
  //       active: true,
  //       windowId,
  //     });
  //     debugger;
  //     const processId = await chrome.processes.getProcessIdForTab(
  //       currentTab.id!
  //     );

  //     await chrome.processes.terminate(processId);
  //   },
  // },
  {
    title: "Reload Tab",
    shortcut: "⌘ r",
    command: async function () {
      await chrome.tabs.reload();
      window.close();
    },
  },
  {
    title: "Reload All Tabs",
    command: async function () {
      const windowId = chrome.windows.WINDOW_ID_CURRENT;
      const allTabIds = (await chrome.tabs.query({ windowId }))
        .map(({ id }) => id)
        .filter(isTruthy);
      for (const id of allTabIds) {
        await chrome.tabs.reload(id);
      }
      window.close();
    },
  },
  {
    title: "Clear Cache and Reload Tab",
    shortcut: "⌘⇧ r",
    command: async function () {
      const tab = await getActiveTab();
      await chrome.tabs.reload(tab.id!, { bypassCache: true });
      window.close();
    },
  },
  {
    title: "Toggle Pin",
    command: async function () {
      const currentTab = await getActiveTab();
      await chrome.tabs.update({ pinned: !currentTab.pinned });
      window.close();
    },
  },
  {
    title: "Duplicate Tab",
    command: async function () {
      const currentTab = await getActiveTab();
      await chrome.tabs.duplicate(currentTab.id!);
    },
  },
  {
    title: "New Incognito Window",
    shortcut: "⌘⇧ n",
    command: async function () {
      await chrome.windows.create({ incognito: true });
    },
  },
  {
    title: "Close Other Tabs",
    command: async function () {
      const windowId = chrome.windows.WINDOW_ID_CURRENT;
      const otherTabs = await chrome.tabs.query({
        active: false,
        windowId,
      });
      const otherTabIds = otherTabs.map(({ id }) => id!);
      await chrome.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    title: "Close Tabs To Right",
    command: async function () {
      const windowId = chrome.windows.WINDOW_ID_CURRENT;
      const currentTab = await getActiveTab();
      const otherTabs = await chrome.tabs.query({
        active: false,
        windowId,
      });
      const otherTabIds = otherTabs
        .filter((tab) => tab.index > currentTab.index)
        .map(({ id }) => id!);
      await chrome.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    title: "Close Tabs To Left",
    command: async function () {
      const currentTab = await getActiveTab();
      const windowId = chrome.windows.WINDOW_ID_CURRENT;
      const otherTabs = await chrome.tabs.query({
        active: false,
        windowId,
      });
      const otherTabIds = otherTabs
        .filter((tab) => tab.index < currentTab.index)
        .map(({ id }) => id!);
      await chrome.tabs.remove(otherTabIds);
      window.close();
    },
  },
  {
    title: "Mute/Unmute Tab",
    command: async function () {
      const currentTab = await getActiveTab();
      const isMuted = currentTab.mutedInfo!.muted;
      await chrome.tabs.update({ muted: !isMuted });
      window.close();
    },
  },
  {
    title: "Move Tab To Start",
    command: async function () {
      const currentTab = await getActiveTab();
      await chrome.tabs.move(currentTab.id!, { index: 0 });
      window.close();
    },
  },
  {
    title: "Move Tab To End",
    command: async function () {
      const currentTab = await getActiveTab();
      await chrome.tabs.move(currentTab.id!, { index: -1 });
      window.close();
    },
  },
  {
    title: "Move Tab Left",
    command: async function () {
      const currentTab = await getActiveTab();
      await chrome.tabs.move(currentTab.id!, {
        index: currentTab.index - 1,
      });
      window.close();
    },
  },
  {
    title: "Move Tab Right",
    command: async function () {
      const currentTab = await getActiveTab();
      await chrome.tabs.move(currentTab.id!, {
        index: currentTab.index + 1,
      });
      window.close();
    },
  },
  {
    title: "Reopen/Unclose Tab",
    shortcut: "⌘⇧ t",
    command: async function () {
      return await chrome.sessions.restore();
    },
  },
  {
    title: "Deattach Tab (Move to New Window)",
    command: async function () {
      const [tab] = await chrome.tabs.query({
        currentWindow: true,
        active: true,
      });
      await chrome.windows.create({ tabId: tab.id });
    },
  },
  {
    title: "Reattach Tab (Move Tab to Previous Window)",
    command: async function () {
      const [currentTab] = await chrome.tabs.query({
        currentWindow: true,
        active: true,
      });
      const currentWindow = await chrome.windows.getCurrent({
        // windowTypes: ["normal"],
      });
      const allWindows = await chrome.windows.getAll({
        windowTypes: ["normal"],
      });
      const otherWindows = allWindows.filter(
        (win) => win.id !== currentWindow.id
      );
      const prevWindow = otherWindows[0];
      await chrome.windows.update(prevWindow.id!, { focused: true });
      await chrome.tabs.move(currentTab.id!, {
        windowId: prevWindow.id,
        index: -1,
      });
      await chrome.tabs.update(currentTab.id!, { highlighted: true });
    },
  },
  {
    title: "Toggle full screen",
    shortcut: "⌃⌘ f",
    command: async function () {
      const currWindow = await chrome.windows.getCurrent();
      const state = currWindow.state === "fullscreen" ? "normal" : "fullscreen";
      chrome.windows.update(currWindow.id!, {
        state,
      });
      window.close();
    },
  },
  {
    title: "Clear browsing history, cookies and cache",
    shortcut: "⌘⇧ ⌫",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/clearBrowserData" });
    },
  },
  {
    title: "Open Chrome SignIn internals",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://signin-internals/" });
    },
  },
  {
    title: "Open Chrome Apps",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://apps/" });
    },
  },
  {
    title: "Configure Chrome internal flags",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://flags/" });
    },
  },
  {
    title: "Configure Third-party Cookies",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/cookies" });
    },
  },
  {
    title: "Configure Ad privacy",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/adPrivacy" });
    },
  },
  {
    title: "Configure Sync and Google Services",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/syncSetup" });
    },
  },
  {
    title: "Configure Chrome Profile",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/manageProfile" });
    },
  },
  {
    title: "Import Bookmarks & Settings",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/importData" });
    },
  },
  {
    title: "Configure Addresses",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/addresses" });
    },
  },
  {
    title: "Configure Autofill & Passwords",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/autofill" });
    },
  },
  {
    title: "Configure Payment Methods",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/payments" });
    },
  },
  {
    title: "Configure Site Settings & Permissions",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/content" });
    },
  },
  {
    title: "Configure Security",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/security" });
    },
  },
  {
    title: "Configure Privacy and security",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/privacy" });
    },
  },
  {
    title: "Configure Search engine",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/defaultBrowser" });
    },
  },
  {
    title: "Configure Default chrome",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/defaultBrowser" });
    },
  },
  {
    title: "Configure on Start-up",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/onStartup" });
    },
  },
  {
    title: "Configure Languages",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/languages" });
    },
  },
  {
    title: "Configure Accessibility",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/accessibility" });
    },
  },
  {
    title: "Configure System & Proxy",
    command: async function () {
      await chrome.tabs.create({ url: "chrome://settings/system" });
    },
  },
  {
    title: "Reset chrome settings",
    command: async function () {
      await chrome.tabs.create({
        url: "chrome://settings/resetProfileSettings?origin=userclick",
      });
    },
  },
  {
    title: "About chrome",
    command: async function () {
      await chrome.tabs.create({
        url: "chrome://settings/help",
      });
    },
  },
  // {
  //   title: "Print page",
  //   shortcut: "⌘ p",
  //   command: async function () {
  //     const currentTab = await getActiveTab();
  //     chrome.tabs.update(currentTab.id!, { url: "chrome://print" });
  //   },
  // },
  {
    title: "Reset command history",
    subtitle: "Resets the order of commands in this extension",
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
