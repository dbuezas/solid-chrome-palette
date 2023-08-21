import { matchCommand, parsedInput, setInput } from "~/util/signals";

import { Command } from "./general";

const KEYWORD = "gpt";

const base: Command[] = [
  {
    title: "Query ChatGPT",
    icon: "https://chat.openai.com/",
    command: async function () {
      setInput(KEYWORD + ">");
    },
    keyword: KEYWORD + ">",
  },
];
const commands = () => [
  {
    title: "ChatGPT: " + parsedInput().query,
    command: async function () {
      chrome.runtime.sendMessage({
        action: "createTabAndSendMessage",
        query: parsedInput().query,
      });
    },
  },
];

export default function chatGptSuggestions(): Command[] {
  const { isMatch, isCommand } = matchCommand(KEYWORD);
  if (isMatch) return commands();
  if (isCommand) return [];
  return base;
}
