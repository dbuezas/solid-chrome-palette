// render inside top level Solid component
import "./Shortcut.scss";

import { Show } from "solid-js";

export default function Shortcut(props: { keys?: string }) {
  return (
    <Show when={props.keys}>
      {(keys) => (
        <span class="Shortcut">
          {keys()
            .replaceAll(" ", "")
            .split("")
            .map((c) => (
              <kbd>{c}</kbd>
            ))}
        </span>
      )}
    </Show>
  );
}
