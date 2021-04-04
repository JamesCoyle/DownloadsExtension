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
	}

	clear() {
		// remove all completed downloads
		for (const id in this.downloads) {
			if (this.downloads[id] === 'complete') delete this.downloads[id]
		}

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
	notificationsEnabled: false,
}

// get localstorage and keep up to date on changes
chrome.storage.local.get(null, updateStoredValues)
chrome.storage.local.onChanged.addListener((changes) => {
	Object.keys(changes).map((key) => {
		changes[key] = changes[key].newValue
	})
	updateStoredValues(changes)
})

// detect when popup opened
chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== 'popup') return

	downloads.clear()

	// todo : continuously send message from popup when open
})

/**
 * Update any local values from the localstorage
 * @param param0 an object with values stored in localstorage
 */
function updateStoredValues({ notificationsEnabled, theme, prefersLightTheme, prefersDarkTheme, showShelf }) {
	settings.notificationsEnabled = notificationsEnabled ?? settings.notificationsEnabled

	// update icon if theme changed
	if (theme !== undefined) updateIcon(theme, prefersLightTheme, prefersDarkTheme)

	// update shelf visibility if changed
	if (showShelf !== undefined) chrome.downloads.setShelfEnabled(showShelf)
}

/**
 *
 * Set icon to match user's theme
 * @param {("auto"|"light"|"dark")} theme The users theme preference
 * @param {boolean} light Light mode prefered
 * @param {boolean} dark Dark mode prefered
 */
function updateIcon(theme, light = false, dark = false) {
	if (theme === 'auto') {
		theme = light ? 'light' : dark ? 'dark' : 'default'
	}

	chrome.browserAction.setIcon({
		path: {
			16: `icons/${theme}/icon-16.png`,
			24: `icons/${theme}/icon-24.png`,
			32: `icons/${theme}/icon-32.png`,
			48: `icons/${theme}/icon-48.png`,
		},
	})
}
