setIcon()
setShelf()

// Perform updates on settings changes.
chrome.storage.sync.onChanged.addListener((changes) => {
	const changedKeys = Object.keys(changes)

	changedKeys.forEach((key) => {
		switch (key) {
			case 'showShelf':
				setShelf()
				break

			case 'icon':
			case 'theme':
			case 'detectedTheme':
				setIcon()
				break
		}
	})
})

// Updates the action icon to match current theme/icon settings.
function setIcon() {
	chrome.storage.sync
		.get({
			icon: 'auto',
			theme: 'auto',
			detectedTheme: 'default',
		})
		.then(({ icon, theme, detectedTheme }) => {
			console.log(icon, theme, detectedTheme)
			const folder = icon !== 'auto' ? icon : theme !== 'auto' ? theme : detectedTheme || 'default'

			chrome.action
				.setIcon({
					path: {
						16: `icons/${folder}/icon-16.png`,
						24: `icons/${folder}/icon-24.png`,
						32: `icons/${folder}/icon-32.png`,
						48: `icons/${folder}/icon-48.png`,
					},
				})
				.then(() => console.log('Icon set', { folder }))
		})
}

// Sets the visibility of the default Chrome downloads shelf.
function setShelf() {
	chrome.storage.sync
		.get({
			showShelf: true,
		})
		.then(({ showShelf }) => {
			try {
				chrome.downloads.setShelfEnabled(showShelf)
			} catch (e) {
				console.warn(e)
			}
			console.log('Shelf set', { showShelf })
		})
}

/// ======== OLD =========

// importScripts('downloads.js')

// const downloads = new Downloads()

// // clear completed downloads when popup open
// chrome.runtime.onMessage.addListener(() => {
// 	downloads.clearAll()
// })

// // set notification handlers when allowed
// chrome.permissions.contains({ permissions: ['notifications'] }, (allowed) => {
// 	if (!allowed) return
// 	setNotificationEventHandlers()
// })
// chrome.permissions.onAdded.addListener(({ permissions }) => {
// 	if (permissions.includes('notifications')) setNotificationEventHandlers()
// })

// /**
//  * Set the listeners to handle notification click events
//  */
// function setNotificationEventHandlers() {
// 	console.log('notification handlers set')

// 	// open file on notification click
// 	chrome.notifications.onClicked.addListener((notificationId) => {
// 		const downloadId = parseInt(notificationId)
// 		chrome.downloads.open(downloadId)
// 		downloads.clear(parseInt(downloadId))
// 	})

// 	// open file or folder when notification buttons clicked
// 	chrome.notifications.onButtonClicked.addListener((notificationId, showInFolder) => {
// 		const downloadId = parseInt(notificationId)
// 		if (showInFolder) chrome.downloads.show(downloadId)
// 		else chrome.downloads.open(downloadId)
// 		downloads.clear(parseInt(downloadId))
// 	})
// }
