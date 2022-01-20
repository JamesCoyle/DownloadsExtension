import Download, { getDownloads } from './classes/download'

setIcon()
setShelf()
updateDownloads()

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

// Get downloads on change.
chrome.downloads.onChanged.addListener(() => {
	updateDownloads()
})

// Retreives latest download information and handles badge updates and notifications.
function updateDownloads() {
	getDownloads().then((downloads) => {
		const states = getStates(downloads)
		const stateValues = Array.from(states.values())
		const dominantState = getDominantState(stateValues)
		const completedDownloads = stateValues.filter((state) => state === Download.state.complete).length
		const activeDownloads = stateValues.filter((state) => [Download.state.downloading, Download.state.paused, Download.state.error, Download.state.complete].includes(state)).length

		setBadge(dominantState, completedDownloads, activeDownloads)

		chrome.storage.local.get('states').then((oldStates) => {
			// todo: Compare old states with new states and push out notifications.

			// Update stored states.
			chrome.storage.local.set({ states: Object.fromEntries(states) })
		})
	})
}

// Updates the action icon to match current theme/icon settings.
function setIcon() {
	chrome.storage.sync
		.get({
			icon: 'auto',
			theme: 'auto',
			detectedTheme: 'default',
		})
		.then(({ icon, theme, detectedTheme }) => {
			const folder = icon !== 'auto' ? icon : theme !== 'auto' ? theme : detectedTheme || 'default'

			chrome.action
				.setIcon({
					path: {
						16: `/icons/${folder}/icon-16.png`,
						24: `/icons/${folder}/icon-24.png`,
						32: `/icons/${folder}/icon-32.png`,
						48: `/icons/${folder}/icon-48.png`,
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

// Sets the badge on the popup icon.
function setBadge(dominantState, completed, active) {
	console.log({ dominantState, completed, active })

	const colors = {
		[Download.state.complete]: '#33993B',
		[Download.state.downloading]: '#3369d7',
		[Download.state.paused]: '#FFC247',
		[Download.state.error]: '#FE4134',
	}
	const text = dominantState === Download.state.complete ? active.toString() : completed + '/' + active

	chrome.action.setBadgeBackgroundColor({ color: colors[dominantState] })
	chrome.action.setBadgeText({ text })
}

// Creates a Map containing download ids and their corrosponding download states.
function getStates(downloads) {
	const states = new Map()

	for (const dl of downloads) {
		states.set(dl.id, dl.state)
	}

	return states
}

// Returns the most important download state from an array of download states.
function getDominantState(states) {
	const priorities = [Download.state.error, Download.state.downloading, Download.state.paused]

	for (const state of priorities) {
		if (states.includes(state)) return state
	}

	return Download.state.complete
}

/// ======== OLD =========

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
