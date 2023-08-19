import "./App.scss";

import fuzzysort from "fuzzysort";
import InfiniteScroll from "solid-infinite-scroll";
import { createEffect, createMemo, createSignal } from "solid-js";
import tinykeys from "tinykeys";

import Entry from "./Entry";
import Shortcut from "./Shortcut";
import audibleTabSuggestions from "./commands/audio";
import bookmarkThisSuggestions from "./commands/bookmark-this";
import bookmarkSuggestions from "./commands/bookmarks";
import commandSuggestions, { Command } from "./commands/general";
import historySuggestions from "./commands/history";
import switchTabSuggestions from "./commands/tabs";
import themeSuggestions from "./commands/themes";
import websitesSuggestions from "./commands/website-search";
import browser from "./util/browser";
import { sortByUsed, storeLastUsed } from "./util/last-used";
import { createLazyResource, inputSignal, parsedInput } from "./util/signals";

const shortcut = createLazyResource("unset", async () => {
  const commands = await browser.commands.getAll();
  const mainCommand = commands.find(({ name }) => name === "_execute_action");
  if (mainCommand?.shortcut) return mainCommand.shortcut;
  return "unset";
});

const [inputValue, setInputValue] = inputSignal;

const allCommands = createMemo(() => {
  let commands: Command[] = [
    ...commandSuggestions(),
    ...audibleTabSuggestions(),
    ...switchTabSuggestions(),
    ...historySuggestions(),
    ...bookmarkSuggestions(),
    ...bookmarkThisSuggestions(),
    ...websitesSuggestions(),
    ...themeSuggestions(),
  ];
  sortByUsed(commands);
  return commands;
});

const [scrollIndex, setScrollIndex] = createSignal(50);

const matches = createMemo(() => {
  return fuzzysort.go(parsedInput().query, allCommands(), {
    threshold: -10000, // don't return bad results
    limit: scrollIndex(), // Don't return more results than this (lower is faster)
    all: true, // If true, returns all results for an empty search
    keys: ["title", "subtitle"], // For when targets are objects (see its example usage)
    // keys: null, // For when targets are objects (see its example usage)
    // scoreFn: null, // For use with `keys` (see its example usage)
  });
});
const filteredCommands = createMemo(() => {
  return matches().map((match) => match.obj);
});

const [selectedI_internal, setSelectedI] = createSignal(0);

const selectedI = createMemo(() => {
  const n = filteredCommands().length;
  return ((selectedI_internal() % n) + n) % n;
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
    const selected = filteredCommands()[selectedI()];
    selected.command();
    storeLastUsed(selected);
    setSelectedI(0);
  },
});

const App = () => {
  createEffect(() => {
    inputValue();
    setScrollIndex(50);
  });
  return (
    <div class="App">
      <div class="input_wrap">
        <input
          class="input"
          autofocus
          placeholder="Type to search..."
          value={inputValue()}
          onBlur={(e) => {
            e.target.focus();
          }}
          onInput={(e) => {
            setInputValue(e.target.value);
            setSelectedI(0);
          }}
        />
        <Shortcut keys={shortcut()} />
      </div>
      <ul class="list">
        <InfiniteScroll
          loadingMessage={<></>}
          each={filteredCommands()}
          hasMore={true}
          next={() => setScrollIndex(scrollIndex() + 50)}
        >
          {(command, i) => {
            const isSelected = createMemo(() => i() === selectedI());
            return (
              <Entry
                isSelected={isSelected()}
                keyResults={matches()[i()]}
                setSelected={() => setSelectedI(i())}
                command={command}
              />
            );
          }}
        </InfiniteScroll>
      </ul>
    </div>
  );
};

export default App;
