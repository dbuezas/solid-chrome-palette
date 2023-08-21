const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function listen() {
  const response = await chrome.runtime.sendMessage({
    action: "chatgpt-client",
  });

  if (response.action === "query") {
    while (true) {
      await sleep(500);
      const textarea = document.querySelector("textarea")!; // Adjust the selector to match your specific textarea
      if (!textarea) {
        continue;
      }

      textarea.value = response.query;
      textarea.dispatchEvent(
        new Event("input", {
          bubbles: true,
          cancelable: true,
        })
      );

      while (true) {
        await sleep(500);
        textarea.parentElement!.querySelector("button")!.click();
        if (textarea.value === "") return;
      }
    }
  }
}
listen();
