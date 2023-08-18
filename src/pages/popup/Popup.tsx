// render inside top level Solid component

import fuzzysort from "fuzzysort";
import InfiniteScroll from "solid-infinite-scroll";
import { Show, createEffect, createMemo, createSignal } from "solid-js";
import tinykeys from "tinykeys"; // Or `window.tinykeys` using the CDN version
import browser from "~/browser";
import styles from "./Popup.module.css";
import { audibleTabSuggestions } from "./hooks/audioSuggestions";
import { bookmarkSuggestions } from "./hooks/bookmarkSuggestions";
import { bookmarkThisSuggestions } from "./hooks/bookmarkThisSuggestions";
import commandSuggestions, { Command } from "./hooks/commandsSuggestions";
import { historySuggestions } from "./hooks/historySuggestions";
import { switchTabSuggestions } from "./hooks/tabsSuggestions";
import { websitesSuggestions } from "./hooks/websitesSuggestions";
import { sortByUsed, storeLastUsed } from "./last-used";
import { createLazyResource, inputSignal, parsedInput } from "./signals";

const shortcut = createLazyResource("unset", async () => {
  const commands = await browser.commands.getAll();
  const mainCommand = commands.find(({ name }) => name === "_execute_action");
  if (mainCommand?.shortcut) return mainCommand.shortcut;
  return "unset";
});

const [inputValue, setInputValue] = inputSignal;
let last;
const allCommands = createMemo(() => {
  let commands: Command[] = [
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

const [scrollIndex, setScrollIndex] = createSignal(50);

const matches = createMemo(() => {
  return fuzzysort.go(parsedInput().query, allCommands(), {
    threshold: -10000, // don't return bad results
    limit: scrollIndex(), // Don't return more results than this (lower is faster)
    all: true, // If true, returns all results for an empty search
    key: "name", // For when targets are objects (see its example usage)
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
function faviconURL(u: string) {
  const url = new URL(browser.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
}
const sep = String.fromCharCode(0);

const Item = (props: {
  isSelected: boolean;
  setSelected: () => void;
  command: Command;
  keyResult: Fuzzysort.KeyResult<Command>;
}) => {
  const entry = createMemo(() => {
    console.log("entry memo");
    const text = !parsedInput().query
      ? props.command.name
      : fuzzysort.highlight(props.keyResult, sep, sep) || props.command.name;
    const idx = text.indexOf("\n");
    const itemText = idx === -1 ? text : text.slice(0, idx);
    const subitemText = idx === -1 ? "" : text.slice(idx + 1);
    return { itemText, subitemText };
  });
  const itemText = createMemo(() => entry().itemText);
  const subitemText = createMemo(() => entry().subitemText);
  const hasSubitem = createMemo(() => props.command.name.includes("\n"));
  return (
    <li
      classList={{
        [styles.selected]: props.isSelected,
        [styles.li]: true,
      }}
      onMouseMove={props.setSelected}
      onclick={() => props.command.command()}
      ref={(el) => {
        createEffect(() => {
          if (props.isSelected) {
            el.scrollIntoView({ behavior: "auto", block: "nearest" });
          }
        });
      }}
    >
      <Show when={props.command.icon}>
        {(icon) => (
          <img
            classList={{
              [styles.img]: true,
              [styles.img_big]: hasSubitem(),
            }}
            src={faviconURL(icon())}
            alt=""
          />
        )}
      </Show>

      <div>
        {itemText()
          .split(sep)
          .map((t, i) => (i % 2 ? <b>{t}</b> : t))}
        <br />
        <span class={styles.subitem}>
          {subitemText()
            .split(sep)
            .map((t, i) => (i % 2 ? <b>{t}</b> : t))}
        </span>
      </div>
      <Show when={props.command.shortcut}>
        <kbd>{props.command.shortcut}</kbd>
      </Show>
    </li>
  );
};

const App = () => {
  createEffect(() => {
    inputValue();
    setScrollIndex(50);
  });
  return (
    <div class={styles.App}>
      <div class={styles.input_wrap}>
        <input
          class={styles.input}
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
        <kbd>{shortcut()}</kbd>
      </div>
      <ul class={styles.list}>
        <InfiniteScroll
          loadingMessage={<></>}
          each={filteredCommands()}
          hasMore={true}
          next={() => setScrollIndex(scrollIndex() + 50)}
        >
          {(command, i) => {
            const isSelected = createMemo(() => i() === selectedI());
            return (
              <Item
                isSelected={isSelected()}
                keyResult={matches()[i()]}
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
