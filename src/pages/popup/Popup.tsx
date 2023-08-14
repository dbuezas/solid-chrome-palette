// render inside top level Solid component

import fuzzysort from "fuzzysort";
import { For, createEffect, createMemo, createSignal } from "solid-js";
import tinykeys from "tinykeys"; // Or `window.tinykeys` using the CDN version
import browser from "webextension-polyfill";
import { audibleTabSuggestions } from "./hooks/audioSuggestions";
import { bookmarkSuggestions } from "./hooks/bookmarkSuggestions";
import { bookmarkThisSuggestions } from "./hooks/bookmarkThisSuggestions";
import commandSuggestions from "./hooks/commandsSuggestions";
import { historySuggestions } from "./hooks/historySuggestions";
import { switchTabSuggestions } from "./hooks/tabsSuggestions";
import { websitesSuggestions } from "./hooks/websitesSuggestions";
import { sortByUsed, storeLastUsed } from "./last-used";
import { inputSignal, parsedInput } from "./signals";

const [selectedI_internal, setSelectedI] = createSignal(0);

const selectedI = () => {
  const n = filteredCommands().length;
  return ((selectedI_internal() % n) + n) % n;
};

const [shortcut, setShortcut] = createSignal("unset");
const [inputValue, setInputValue] = inputSignal;

const allCommands = createMemo(() => {
  let commands = [
    ...commandSuggestions(),
    ...audibleTabSuggestions(),
    ...switchTabSuggestions(),
    ...historySuggestions(),
    ...bookmarkSuggestions(),
    ...bookmarkThisSuggestions(),
    ...websitesSuggestions(),
  ];
  sortByUsed(commands);
  return commands;
});

const filteredCommands = createMemo(() => {
  const results = fuzzysort.go(parsedInput().query, allCommands(), {
    threshold: -Infinity, // Don't return matches worse than this (higher is faster)
    limit: 100, // Don't return more results than this (lower is faster)
    all: true, // If true, returns all results for an empty search
    key: "name", // For when targets are objects (see its example usage)
    // keys: null, // For when targets are objects (see its example usage)
    // scoreFn: null, // For use with `keys` (see its example usage)
  });
  return results;
});

tinykeys(window, {
  ArrowUp: (e) => {
    e.preventDefault();
    setSelectedI((i) => i - 1);
  },
  ArrowDown: (e) => {
    e.preventDefault();
    setSelectedI((i) => i + 1);
  },
  Enter: (e) => {
    e.preventDefault();
    const selected = filteredCommands().at(selectedI()).obj;
    selected.command();
    storeLastUsed(selected);
    setSelectedI(0);
    // window.close();
  },
});

browser?.commands?.getAll().then(async (commands) => {
  const mainCommand = commands.find(({ name }) => name === "_execute_action");
  if (mainCommand?.shortcut) setShortcut(mainCommand.shortcut);
});

const App = () => {
  return (
    <div class="my-app">
      <p>{shortcut()}</p>
      <input
        autofocus
        value={inputValue()}
        onInput={(e) => {
          setInputValue(e.target.value);
          setSelectedI(0);
        }}
      />
      <div class="list">
        <For each={filteredCommands()}>
          {(match, i) => {
            let el;
            createEffect(() => {
              if (i() === selectedI())
                el.scrollIntoView({ behavior: "auto", block: "nearest" });
            });
            return (
              <p
                onclick={() => match.obj.command()}
                ref={el}
                style={{
                  background: i() === selectedI() ? "lightgrey" : undefined,
                }}
              >
                {!parsedInput().query
                  ? match.obj.name
                  : fuzzysort.highlight(match, (m, i) => <b>{m}</b>)}
              </p>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default App;
