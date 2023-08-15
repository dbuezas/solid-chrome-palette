// render inside top level Solid component

import fuzzysort from "fuzzysort";
import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
import tinykeys from "tinykeys"; // Or `window.tinykeys` using the CDN version
import browser from "webextension-polyfill";
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

const [selectedI_internal, setSelectedI] = createSignal(0);

const selectedI = () => {
  const n = filteredCommands().length;
  return ((selectedI_internal() % n) + n) % n;
};

const shortcut = createLazyResource("unset", async () => {
  const commands = await browser?.commands?.getAll();
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
function faviconURL(u: string) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
}
const sep = String.fromCharCode(0);
const App = () => {
  return (
    <div class={styles.App}>
      <p>{shortcut()}</p>
      <input
        class={styles.input}
        autofocus
        placeholder="Type to search"
        value={inputValue()}
        onBlur={(e) => {
          e.target.focus();
        }}
        onInput={(e) => {
          setInputValue(e.target.value);
          setSelectedI(0);
        }}
      />
      <ul class={styles.list}>
        <For each={filteredCommands()}>
          {(match, i) => {
            let el;
            const isSelected = () => i() === selectedI();
            createEffect(() => {
              if (isSelected())
                el.scrollIntoView({ behavior: "auto", block: "nearest" });
            });
            const text = !parsedInput().query
              ? match.obj.name
              : fuzzysort.highlight(match, sep, sep);

            const idx = text.indexOf("\n");
            const item = idx === -1 ? text : text.slice(0, idx);
            const subitem = idx === -1 ? "" : text.slice(idx + 1);

            return (
              <>
                <li
                  classList={{
                    [styles.selected]: isSelected(),
                  }}
                  onMouseEnter={() => setSelectedI(i())}
                  onclick={() => match.obj.command()}
                  ref={el}
                >
                  <Show when={match.obj.icon}>
                    <img
                      classList={{
                        [styles.img]: true,
                        [styles.img_big]: !!subitem,
                      }}
                      src={faviconURL(match.obj.icon)}
                      alt=""
                    />
                  </Show>

                  <div>
                    {item.split(sep).map((t, i) => (i % 2 ? <b>{t}</b> : t))}
                    <br />
                    <span class={styles.subitem}>
                      {subitem
                        .split(sep)
                        .map((t, i) => (i % 2 ? <b>{t}</b> : t))}
                    </span>
                  </div>
                </li>
              </>
            );
          }}
        </For>
      </ul>
    </div>
  );
};

export default App;
