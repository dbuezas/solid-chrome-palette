import { createMemo, createSignal } from "solid-js";

export const inputSignal = createSignal("");

export const [input, setInput] = inputSignal;

export const parsedInput = createMemo(() => {
  const [match, keyword, query] = input().match(/^([a-zA-Z]{1,2})>(.*)/) || [];
  return {
    isCommand: match !== undefined,
    keyword: keyword?.toLowerCase() || "",
    query: match !== undefined ? query : input(),
  };
});

export const matchCommand = (keyword: string) => {
  const parsed = parsedInput();
  return {
    isMatch: keyword === parsed.keyword,
    isCommand: parsed.keyword,
    query: parsed.query,
  };
};

export const createLazyResource = <T,>(
  initialValue: T,
  fetcher: () => Promise<T>
) => {
  const [val, setVal] = createSignal(initialValue);
  const [fetched, setFetched] = createSignal(false);
  return () => {
    if (!fetched()) {
      fetcher().then(setVal);
      setFetched(true);
    }
    return val();
  };
};
