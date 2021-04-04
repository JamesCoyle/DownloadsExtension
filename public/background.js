const settings = {
	notificationsEnabled = false
}

chrome.storage.local.get(null, updateStoredValues)
chrome.storage.local.onChanged.addListener((changes) => {
	Object.keys(changes).map((key) => {
		changes[key] = changes[key].newValue
	})
	updateStoredValues(changes)
})

/**
 * Update any local values from the localstorage
 * @param param0 an object with values stored in localstorage
 */
function updateStoredValues({ theme, notificationsEnabled }) {
	settings.notificationsEnabled = notificationsEnabled ?? settings.notificationsEnabled

	// set icon to match theme
	chrome.browserAction.setIcon({
		path: {
			16: `icons/${theme}/icon-16.png`,
			24: `icons/${theme}/icon-24.png`,
			32: `icons/${theme}/icon-32.png`,
			48: `icons/${theme}/icon-48.png`,
		},
	})
}
