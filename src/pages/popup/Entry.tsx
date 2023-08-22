// render inside top level Solid component
import "./Entry.scss";

import fuzzysort from "fuzzysort";
import { Show, createEffect, createMemo } from "solid-js";
import twas from "twas";

import Keyword from "./Keyword";
import Shortcut from "./Shortcut";
import { Command } from "./commands/general";
import { storeLastUsed } from "./util/last-used";
import { parsedInput } from "./util/signals";

function faviconURL(u: string) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

export default function Entry(props: {
  isSelected: boolean;
  command: Command;
  keyResults: Fuzzysort.KeysResult<Command>;
}) {
  const subtitle = createMemo(() => {
    if (!parsedInput().query) return props.command.subtitle || "";
    return (
      fuzzysort.highlight(props.keyResults[1], (t) => <b>{t}</b>) ||
      props.command.subtitle ||
      ""
    );
  });
  return (
    <li
      class="Entry"
      classList={{
        selected: props.isSelected,
      }}
      onclick={() => {
        storeLastUsed(props.command);
        props.command.command();
      }}
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
              img: true,
              img_big: !!subtitle(),
            }}
            src={faviconURL(icon())}
            alt=""
            loading="lazy"
          />
        )}
      </Show>

      <div class="text">
        <div class="title">
          <Show when={parsedInput().query} fallback={props.command.title}>
            {fuzzysort.highlight(props.keyResults[0], (t) => <b>{t}</b>) ||
              props.command.title}
          </Show>
        </div>
        <div class="subtitle">
          <Show when={parsedInput().query} fallback={props.command.subtitle}>
            {fuzzysort.highlight(props.keyResults[1], (t) => <b>{t}</b>) ||
              props.command.subtitle}
          </Show>
          <Show when={props.command.lastVisitTime}>
            {(time) => <span class="time_ago">{twas(time())}</span>}
          </Show>
        </div>
      </div>
      <Shortcut keys={props.command.shortcut} />
      <Keyword keyword={props.command.keyword} />
    </li>
  );
}
