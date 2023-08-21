chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install") {
    return;
  }

  chrome.alarms.onAlarm.addListener((alarm) => {
    console.log({ alarm }, new Date());
  });
  // Create an alarm so we have something to look at in the demo
  await chrome.alarms.create("watchdog", {
    delayInMinutes: 0,
    periodInMinutes: 1,
  });
});
