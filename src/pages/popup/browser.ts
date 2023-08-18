// import type { Browser } from "webextension-polyfill";
// const mockBrowser = {
//   runtime: { getURL: (s: string) => `http://mock/${s}` },
//   tabs: {
//     query: async () => [],
//     update: () => {},
//     remove: () => {},
//     move: (...args: any[]) => {},
//   },
//   sessions: { restore: () => {} },
//   windows: {
//     query: async () => [],
//     update: () => {},
//     WINDOW_ID_CURRENT: 0,
//     create: () => {},
//   },
//   history: { search: async () => [] },
//   commands: { getAll: async () => ({ find: () => {} }) },
// };
// let browser: Browser | typeof mockBrowser = mockBrowser;
// if (!import.meta.env.DEV) {
//   browser = await import("webextension-polyfill");
// }

// export default browser;

import browser from "webextension-polyfill";
export default browser;
