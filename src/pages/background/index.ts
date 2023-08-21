chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install") return;
  chrome.alarms.onAlarm.addListener((alarm) => {
    console.log({ alarm }, new Date());
  });
  await chrome.alarms.create("watchdog", {
    delayInMinutes: 0,
    periodInMinutes: 1,
  });
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "createTabAndSendMessage") {
    const query = request.query;
    const tab = await chrome.tabs.create({ url: "https://chat.openai.com/" });
    const listener = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (sender.tab?.id === tab.id && message.action === "chatgpt-client") {
        chrome.runtime.onMessage.removeListener(listener);
        sendResponse({
          action: "query",
          query,
        });
      }
    };
    chrome.runtime.onMessage.addListener(listener);
  }
});
