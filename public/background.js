let popupOpen = false

function update() {
	// fetch all downloads and watch any in progress
	chrome.downloads.search({}, (downloads) => {
		let downloading = 0

		downloads.forEach((download) => {
			switch (download.state) {
				case 'in_progress':
					downloading++
					break

				case 'complete':
					setDownloadComplete(download)
					break
			}
		})

		chrome.storage.local.get('completeDownloads', ({ completeDownloads }) => {
			const complete = (completeDownloads || []).length
			updateBadge(downloading, complete)
		})

		// if any downloads are in progress monitor for updates
		if (downloading > 0) setTimeout(update, 1000)
	})
}

function addDownload(download) {
	chrome.storage.local.get('activeDownloads', (result) => {
		const activeDownloads = result.activeDownloads || []
		chrome.storage.local.set({ activeDownloads: [...activeDownloads, download.id] })
		update()
	})
}

function setDownloadComplete(download) {
	chrome.storage.local.get('activeDownloads', (result) => {
		const activeDownloads = result.activeDownloads || []

		// return if not found
		if (activeDownloads.indexOf(download.id) < 0) return

		// remove from active
		chrome.storage.local.set({ activeDownloads: activeDownloads.filter((id) => id !== download.id) })

		if (popupOpen) return

		// add to complete
		chrome.storage.local.get('completeDownloads', (result) => {
			let completeDownloads = result.completeDownloads || []
			if (completeDownloads.indexOf(download.id) < 0) {
				chrome.storage.local.set({ completeDownloads: [...completeDownloads, download.id] })
			}
		})

		// notify user
		chrome.notifications.create(download.id.toString(), {
			title: 'Download Complete',
			message: download.filename,
			iconUrl: 'images/download128.png',
			type: 'basic',
			buttons: [{ title: 'Open' }, { title: 'Show in folder' }],
		})
	})
}

function updateBadge(downloading, complete) {
	const total = downloading + complete

	if (downloading) {
		chrome.browserAction.setBadgeBackgroundColor({ color: '#3369d7' })
		chrome.browserAction.setBadgeText({ text: complete + '/' + total })
	} else if (complete && !popupOpen) {
		chrome.browserAction.setBadgeBackgroundColor({ color: '#33991e' })
		chrome.browserAction.setBadgeText({ text: complete.toString() })
	} else {
		chrome.browserAction.setBadgeText({ text: '' })
	}
}

// disable default download shelf
chrome.downloads.setShelfEnabled(true)

// listen for updates
chrome.downloads.onCreated.addListener(addDownload)
chrome.downloads.onChanged.addListener(update)
chrome.downloads.onErased.addListener(update)

// detect when popup opened
chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== 'popup') return

	popupOpen = true
	chrome.storage.local.set({ completeDownloads: [] })
	update()

	port.onDisconnect.addListener(() => {
		popupOpen = false
		update()
	})
})

// open file on notification click
chrome.notifications.onClicked.addListener((notificationId) => {
	const downloadId = parseInt(notificationId)
	chrome.downloads.open(downloadId)
})

// open file or folder when notification buttons clicked
chrome.notifications.onButtonClicked.addListener((notificationId, showInFolder) => {
	const downloadId = parseInt(notificationId)
	if (showInFolder) chrome.downloads.show(downloadId)
	else chrome.downloads.open(downloadId)
})
