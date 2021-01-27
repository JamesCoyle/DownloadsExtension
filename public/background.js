chrome.downloads.onCreated.addListener(addDownload)
chrome.downloads.onChanged.addListener(updateDownload)
chrome.downloads.onErased.addListener(removeDownload)

// remove completed downloads when popup opened
chrome.browserAction.onClicked.addListener(removeCompleted)

function handleUpdate() {
	chrome.action.setBadgeBackgroundColor({ color: '#0000FF' })
	chrome.action.setBadgeText({ text: '1' })
}

function addDownload() {}

function updateDownload() {}

function removeDownload() {}

function removeCompleted() {}
