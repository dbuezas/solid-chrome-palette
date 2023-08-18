if (import.meta.env.DEV) {
  await import("solid-devtools");
}

import { render } from "solid-js/web";
import Popup from "./Popup";
import "./index.css";

const appContainer = document.querySelector("#app-container");
if (!appContainer) {
  throw new Error("Can not find AppContainer");
}

render(Popup, appContainer);
