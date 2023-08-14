import browser from "webextension-polyfill";
import { createLazyResource, parsedInput } from "../signals";
import { Command } from "./commandsSuggestions";

const commands = createLazyResource([], async () => {
  const allTabs = await browser.tabs.query({ audible: true });
  const actions: Command[] = allTabs.map(({ title, url, id, windowId }) => ({
    name: `Sound/Audio tab: ${title}`,
    icon: "chrome://favicon/" + url,
    category: "Tab",
    command: () => {
      browser.tabs.update(id, { highlighted: true });
      browser.windows.update(windowId!, { focused: true });
      window.close();
    },
  }));
  if (actions.length === 0) {
    actions.push({
      name: `Sound/Audio tab: [none]`,
      category: "Tab",
      command: () => {
        window.close();
      },
    });
  }
  return actions;
});

export function audibleTabSuggestions() {
  const { isCommand } = parsedInput();
  if (isCommand) return [];
  return commands();
}
