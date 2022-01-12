console.log('registered')

importScripts('downloads.js')

const downloads = new Downloads()

const settings = {
	theme: 'auto',
	preferedTheme: 'default',
	icon: 'auto',
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
chrome.runtime.onMessage.addListener(() => {
	downloads.clearAll()
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
function updateStoredValues({ notifyOnComplete, notifyOnError, theme, preferedTheme, icon, showShelf }) {
	downloads.settings.notifyOnComplete = notifyOnComplete ?? downloads.settings.notifyOnComplete
	downloads.settings.notifyOnError = notifyOnError ?? downloads.settings.notifyOnError

	settings.theme = theme ?? settings.theme
	settings.preferedTheme = preferedTheme ?? settings.preferedTheme
	settings.icon = icon ?? settings.icon

	// update icon if theme changed
	if (theme !== undefined || icon !== undefined) updateIcon()

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
function updateIcon() {
	const folder = settings.icon && settings.icon !== 'auto' ? settings.icon : settings.theme && settings.theme !== 'auto' ? settings.theme : settings.preferedTheme || 'default'

	chrome.action.setIcon({
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
