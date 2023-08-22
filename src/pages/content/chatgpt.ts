const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const waitFor = async <T>(fn: () => T) => {
  const startT = Date.now();
  while (true) {
    try {
      const r = fn();
      if (r) return r;
    } catch (e) {}
    if (Date.now() - startT > 30_000) throw new Error("Timeout");
    await sleep(100);
  }
};

const waitForIdle = async () => {
  const start = document.documentElement.innerText;
  await sleep(1000);
  if (start !== document.documentElement.innerText) await waitForIdle();
};

(async () => {
  const response = await chrome.runtime.sendMessage({
    action: "chatgpt-client",
  });
  if (response.action === "query") {
    const textarea = await waitFor(() => document.querySelector("textarea")!);

    await waitForIdle();
    textarea.value = response.query;
    textarea.dispatchEvent(
      new Event("input", {
        bubbles: true,
        cancelable: true,
      })
    );

    textarea.parentElement!.querySelector("button")!.click();
  }
})();
