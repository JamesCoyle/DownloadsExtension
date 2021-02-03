let popupOpen = false

function update() {
	chrome.storage.local.get(null, (states) => {
		chrome.downloads.search({}, (downloads) => {
			const ids = downloads.map((d) => d.id.toString())
			const badge = {
				complete: 0,
				total: 0,
				downloading: false,
				error: false,
				paused: false,
			}

			let stateIds = Object.keys(states)

			// remove states which don't have matching download
			stateIds = stateIds.filter((stateId) => {
				if (ids.includes(stateId)) return true

				chrome.storage.local.remove(stateId)
			})

			// loop through all downloads and update state
			downloads.forEach((download) => {
				const id = download.id.toString()
				let state = states[id]

				// return if download not created
				if (!state) return

				// determine download state
				if (download.paused) state = 'paused'
				else if (download.error) {
					if (download.error === 'USER_CANCELED') {
						if (download.filename) chrome.storage.local.set({ [id]: 'canceled' })
						else chrome.downloads.erase({ id: download.id })
					} else chrome.storage.local.set({ [id]: 'error' })
				} else {
					switch (download.state) {
						case 'in_progress':
							state = 'downloading'
							break

						case 'complete':
							state = 'complete'
							break
					}
				}

				// set download state
				chrome.storage.local.set({ [id]: state })

				// notify on completion
				if (state === 'complete' && !popupOpen) {
					chrome.notifications.create(id, {
						title: 'Download Complete',
						message: download.filename,
						iconUrl: 'images/download128.png',
						type: 'basic',
						buttons: [{ title: 'Open' }, { title: 'Show in folder' }],
					})
				}
			})

			// update badge
			stateIds.forEach((id) => {
				const state = states[id]

				switch (state) {
					case 'error':
						badge.error = true
						badge.total++
						break

					case 'canceled':
						break

					case 'downloading':
						badge.downloading = true
						badge.total++
						break

					case 'paused':
						badge.paused = true
						badge.total++

						break

					case 'complete':
						badge.complete++
						badge.total++
						break
				}
			})

			updateBadge(badge)

			// if any downloads are in progress monitor for updates
			if (badge.downloading > 0) setTimeout(update, 1000)
		})
	})
}

function addDownload(download) {
	chrome.storage.local.set({ [download.id.toString()]: 'downloading' })
	update()
}

function updateBadge(state) {
	let color = '#292a2d'
	let text = ''

	if (state.error) {
		color = '#d73333'
		text = state.complete + '/' + state.total
	} else if (state.downloading) {
		color = '#3369d7'
		text = state.complete + '/' + state.total
	} else if (state.paused) {
		color = '#99951e'
		text = state.complete + '/' + state.total
	} else if (state.complete) {
		color = '#33991e'
		text = state.complete.toString()
	}

	chrome.browserAction.setBadgeBackgroundColor({ color })
	chrome.browserAction.setBadgeText({ text })
}

// disable default download shelf
chrome.downloads.setShelfEnabled(false)

// listen for updates
chrome.downloads.onCreated.addListener(addDownload)
chrome.downloads.onChanged.addListener(update)
chrome.downloads.onErased.addListener(update)

// detect when popup opened
chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== 'popup') return

	popupOpen = true
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

update()
