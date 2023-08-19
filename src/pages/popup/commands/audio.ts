import browser from "~/util/browser";
import { createLazyResource, parsedInput } from "~/util/signals";

import { Command } from "./general";

const commands = createLazyResource([], async () => {
  const allTabs = await browser.tabs.query({ audible: true });
  const actions: Command[] = allTabs.map(({ title, url, id, windowId }) => ({
    title: `Sound/Audio tab: ${title}`,
    icon: "chrome://favicon/" + url,
    command: () => {
      browser.tabs.update(id, { highlighted: true });
      browser.windows.update(windowId!, { focused: true });
      window.close();
    },
  }));
  if (actions.length === 0) {
    actions.push({
      title: `Sound/Audio tab: [none]`,
      command: () => {
        window.close();
      },
    });
  }
  return actions;
});

export default function audibleTabSuggestions(): Command[] {
  const { isCommand } = parsedInput();
  if (isCommand) return [];
  return commands();
}
