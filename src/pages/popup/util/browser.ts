/*

// Mocked browser
const browser = {
  runtime: { getURL: (s: string) => `http://mock/${s}` },
  tabs: {
    query: async () => [],
    update: () => {},
    remove: () => {},
    move: (...args: any[]) => {},
    create: (...args: any[]) => {},
  },
  sessions: { restore: () => {} },
  windows: {
    query: async () => [],
    update: () => {},
    WINDOW_ID_CURRENT: 0,
    create: () => {},
  },
  history: { search: async () => [] },
  commands: { getAll: async () => ({ find: () => {} }) },
};
export default browser;

/*/
// Real browser
import browser from "webextension-polyfill";

export default browser;
//*/
