// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-to-wishtracker",
    title: "Add to WishTracker",
    contexts: ["page", "image", "link"],
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-to-wishtracker") {
    // Open popup or separate window to add item
    // Since we cannot programmatically open the extension popup (action),
    // we usually open a new window or inject a content script modal.
    // For MVP, alerting the user to use the popup icon is simplest,
    // OR we can open the web app's "add item" page with query params.

    // Let's open the extension popup logic in a new small window
    chrome.windows.create({
      url: "src/popup/index.html",
      type: "popup",
      width: 400,
      height: 600,
    })
  }
})
