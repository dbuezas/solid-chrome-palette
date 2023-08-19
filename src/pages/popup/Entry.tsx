// render inside top level Solid component
import "./Entry.scss";

import { formatDistanceToNow } from "date-fns";
import fuzzysort from "fuzzysort";
import { Show, createEffect, createMemo } from "solid-js";

import browser from "~/browser";
import { Command } from "~/hooks/commandsSuggestions";
import { parsedInput } from "~/signals";

import Shortcut from "./Shortcut";

const delimiter = String.fromCharCode(0);
function faviconURL(u: string) {
  const url = new URL(browser.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

export default function Entry(props: {
  isSelected: boolean;
  setSelected: () => void;
  command: Command;
  keyResult: Fuzzysort.KeyResult<Command>;
}) {
  const entry = createMemo(() => {
    const text = !parsedInput().query
      ? props.command.name
      : fuzzysort.highlight(props.keyResult, delimiter, delimiter) ||
        props.command.name;
    const i = text.indexOf("\n");
    const itemText = i === -1 ? text : text.slice(0, i);
    const subitemText = i === -1 ? "" : text.slice(i + 1);
    return { itemText, subitemText };
  });
  const itemText = createMemo(() => entry().itemText);
  const subitemText = createMemo(() => entry().subitemText);
  const hasSubitem = createMemo(() => !!subitemText());
  return (
    <li
      class="Entry"
      classList={{
        selected: props.isSelected,
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
              img: true,
              img_big: hasSubitem(),
            }}
            src={faviconURL(icon())}
            alt=""
          />
        )}
      </Show>

      <div class="text">
        <div class="item">
          {itemText()
            .split(delimiter)
            .map((t, i) => (i % 2 ? <b>{t}</b> : t))}
        </div>
        <div class="subitem">
          {subitemText()
            .split(delimiter)
            .map((t, i) => (i % 2 ? <b>{t}</b> : t))}
          <Show when={props.command.lastVisitTime}>
            {(time) => (
              <span class="time_ago">{formatDistanceToNow(time())} ago</span>
            )}
          </Show>
        </div>
      </div>
      <Shortcut keys={props.command.shortcut} />
    </li>
  );
}
