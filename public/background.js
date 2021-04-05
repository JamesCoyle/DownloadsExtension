//#region downloads.js

// todo : move to own file when updating to manifest v3

const badgeColors = {
	error: '#d73333',
	downloading: '#3369d7',
	paused: '#99951e',
	complete: '#33991e',
	default: '#cccccc',
}

class Downloads {
	constructor() {
		this.downloads = {}
		this.settings = {
			notifyOnComplete: false,
			notifyOnError: false,
		}

		// watch for download changes
		chrome.downloads.onChanged.addListener((delta) => {
			const { id, error, filename: downloading, paused, endTime: complete } = delta

			console.log('UPDATE', delta)

			if (complete) this.updateDownload(id, 'complete')
			else if (downloading) this.updateDownload(id, 'downloading')
			else if (paused) this.updateDownload(id, 'paused')
			else if (error) this.updateDownload(id, 'error')
		})
	}

	updateDownload(id, state) {
		this.downloads[id] = state
		this.updateBadge()

		switch (state) {
			case 'error':
				if (this.settings.notifyOnError)
					chrome.notifications.create(id.toString(), {
						title: 'Download Error',
						message: 'An error occured and the download could not be completed.',
						iconUrl: 'images/download128.png',
						type: 'basic',
					})
				break

			case 'complete':
				if (this.settings.notifyOnComplete)
					chrome.notifications.create(id.toString(), {
						title: 'Download Complete',
						message: 'Your download completed successfully.',
						iconUrl: 'images/download128.png',
						type: 'basic',
						buttons: [{ title: 'Open' }, { title: 'Show in folder' }],
					})
				break
		}
	}

	clearAll() {
		for (const id in this.downloads) {
			if (this.downloads[id] === 'complete') {
				delete this.downloads[id]
				if (chrome.notifications) chrome.notifications.clear(id)
			}
		}

		this.updateBadge()
	}

	clear(id) {
		delete this.downloads[id]

		this.updateBadge()
	}

	/**
	 * Computes the dominant state, complete count, and total count then updates badge
	 */
	updateBadge() {
		const totals = Object.values(this.downloads).reduce(
			(totals, state) => {
				totals.total++
				totals[state]++
				return totals
			},
			{
				total: 0,
				error: 0,
				downloading: 0,
				paused: 0,
				complete: 0,
			}
		)
		const state = totals.error ? 'error' : totals.downloading ? 'downloading' : totals.paused ? 'paused' : totals.complete ? 'complete' : 'default'

		this._updateBadgeColor(state)
		this._updateBadgeText(totals.total, totals.complete)
	}

	/**
	 * Updates the color of the browser action badge
	 * @param {State} state The dominant state of all downloads (error > downloading > paused > complete)
	 */
	_updateBadgeColor(state) {
		chrome.browserAction.setBadgeBackgroundColor({ color: badgeColors[state] })
	}

	/**
	 * Update the text of the browser action badge
	 * @param {number} total The total number of downloads since last cleared
	 * @param {number} complete The total number of complete downloads since last cleared
	 */
	_updateBadgeText(total, complete) {
		if (total == 0) chrome.browserAction.setBadgeText({ text: '' })
		else if (complete === total) chrome.browserAction.setBadgeText({ text: complete.toString() })
		else chrome.browserAction.setBadgeText({ text: complete + '/' + total })
	}
}

//#endregion

/**
 * @typedef {"error", "downloading", "paused", "complete"} State
 */

const downloads = new Downloads()

const settings = {
	preferedTheme: 'default',
}

// get localstorage and keep up to date on changes
chrome.storage.local.get(null, updateStoredValues)
chrome.storage.local.onChanged.addListener((changes) => {
	Object.keys(changes).map((key) => {
		changes[key] = changes[key].newValue
	})
	updateStoredValues(changes)
})

// clear completed downloads when popup open
chrome.extension.onConnect.addListener((port) => {
	port.onMessage.addListener(() => {
		downloads.clearAll()
	})
})

// set notification handlers when allowed
chrome.permissions.contains({ permissions: ['notifications'] }, (allowed) => {
	if (!allowed) return
	setNotificationEventHandlers()
})
chrome.permissions.onAdded.addListener(({ permissions }) => {
	if (permissions.includes('notifications')) setNotificationEventHandlers()
})

/**
 * Update any local values from the localstorage
 * @param param0 an object with values stored in localstorage
 */
function updateStoredValues({ notifyOnComplete, notifyOnError, theme, preferedTheme, showShelf }) {
	downloads.settings.notifyOnComplete = notifyOnComplete ?? downloads.settings.notifyOnComplete
	downloads.settings.notifyOnError = notifyOnError ?? downloads.settings.notifyOnError

	settings.preferedTheme = preferedTheme ?? settings.preferedTheme

	// update icon if theme changed
	if (theme !== undefined) updateIcon(theme)

	// update shelf visibility if changed
	if (showShelf !== undefined) chrome.downloads.setShelfEnabled(showShelf || false)
}

/**
 *
 * Set icon to match user's theme
 * @param {("auto"|"light"|"dark")} theme The users theme preference
 * @param {boolean} light Light mode prefered
 * @param {boolean} dark Dark mode prefered
 */
function updateIcon(theme) {
	const folder = theme === 'auto' ? settings.preferedTheme : theme

	chrome.browserAction.setIcon({
		path: {
			16: `icons/${folder}/icon-16.png`,
			24: `icons/${folder}/icon-24.png`,
			32: `icons/${folder}/icon-32.png`,
			48: `icons/${folder}/icon-48.png`,
		},
	})
}

/**
 * Set the listeners to handle notification click events
 */
function setNotificationEventHandlers() {
	console.log('notification handlers set')

	// open file on notification click
	chrome.notifications.onClicked.addListener((notificationId) => {
		const downloadId = parseInt(notificationId)
		chrome.downloads.open(downloadId)
		downloads.clear(parseInt(downloadId))
	})

	// open file or folder when notification buttons clicked
	chrome.notifications.onButtonClicked.addListener((notificationId, showInFolder) => {
		const downloadId = parseInt(notificationId)
		if (showInFolder) chrome.downloads.show(downloadId)
		else chrome.downloads.open(downloadId)
		downloads.clear(parseInt(downloadId))
	})
}
