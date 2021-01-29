let popupOpen = false

function update() {
	// fetch all downloads and watch any in progress
	chrome.downloads.search({}, (downloads) => {
		let downloading = 0
		let paused = 0
		let error = 0

		console.log(downloads)

		downloads.forEach((download) => {
			if (download.paused) paused++
			else if (download.error && download.error != 'USER_CANCELED') error++
			else {
				switch (download.state) {
					case 'in_progress':
						downloading++
						break

					case 'complete':
						setDownloadComplete(download)
						break
				}
			}
		})

		chrome.storage.local.get('completeDownloads', ({ completeDownloads }) => {
			const complete = (completeDownloads || []).length
			const total = downloading + paused + error + complete

			if (error) state = 'error'
			else if (downloading) state = 'downloading'
			else if (paused) state = 'paused'
			else state = 'complete'

			updateBadge(state, total, complete)
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

function updateBadge(state, total, complete) {
	let color = ''
	let text = ''

	console.log(state, total, complete)

	switch (state) {
		case 'downloading':
			color = '#3369d7'
			text = complete + '/' + total
			break

		case 'paused':
			color = '#99951e'
			text = complete + '/' + total
			break

		case 'error':
			color = '#d73333'
			text = complete + '/' + total
			break

		case 'complete':
			color = '#33991e'
			text = complete

		default:
			color = '#5c5c5c'
			text = ''
			break
	}

	chrome.browserAction.setBadgeBackgroundColor({ color })
	chrome.browserAction.setBadgeText({ text })
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
