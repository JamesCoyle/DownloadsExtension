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
					setDownloadComplete(download.id)
					break
			}
		})

		chrome.storage.local.get('completeDownloads', ({ completeDownloads }) => {
			const complete = (completeDownloads || []).length
			updateBadge(downloading, complete)
		})

		// if any downloads are in progress monitor for updates
		if (downloading > 0) setTimeout(update, 500)
	})
}

function addDownload(download) {
	chrome.storage.local.get('activeDownloads', (result) => {
		const activeDownloads = result.activeDownloads || []
		chrome.storage.local.set({ activeDownloads: [...activeDownloads, download.id] })
		update()
	})
}

function setDownloadComplete(downloadId) {
	chrome.storage.local.get('activeDownloads', (result) => {
		const activeDownloads = result.activeDownloads || []

		// return if not found
		if (activeDownloads.indexOf(downloadId) < 0) return

		// remove from active
		chrome.storage.local.set({ activeDownloads: activeDownloads.filter((id) => id !== downloadId) })

		if (popupOpen) return

		// add to complete
		chrome.storage.local.get('completeDownloads', (result) => {
			let completeDownloads = result.completeDownloads || []
			if (completeDownloads.indexOf(downloadId) < 0) {
				chrome.storage.local.set({ completeDownloads: [...completeDownloads, downloadId] })
			}
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

chrome.downloads.setShelfEnabled(true)

chrome.downloads.onCreated.addListener(addDownload)
chrome.downloads.onChanged.addListener(update)
chrome.downloads.onErased.addListener(update)

chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== 'popup') return

	popupOpen = true
	chrome.storage.local.set({ completeDownloads: [] })

	port.onDisconnect.addListener(() => {
		popupOpen = false
	})
})

// chrome.runtime.onSuspend.addListener(function () {
// 	console.log('Unloading.')
// 	chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' })
// 	chrome.browserAction.setBadgeText({ text: 'DED' })
// })
