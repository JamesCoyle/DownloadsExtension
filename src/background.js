import Download, { getDownloads } from './classes/download'
import Notify from './classes/notify'

setIcon()
setShelf()
updateDownloads()

// Clean local storage on install.
chrome.runtime.onInstalled.addListener((details) => {
	chrome.storage.local.clear()
})

// Perform updates on settings changes.
chrome.storage.sync.onChanged.addListener((changes) => {
	for (const key of Object.keys(changes)) {
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
	}
})

// Perform updates on local data changes.
chrome.storage.local.onChanged.addListener((changes) => {
	for (const key of Object.keys(changes)) {
		switch (key) {
			// Update downloads list on viewed list change.
			case 'seen':
				updateDownloads()
				break
		}
	}
})

// Get downloads on change.
chrome.downloads.onChanged.addListener(() => {
	updateDownloads()
})

// Retreives latest download information and handles badge updates and notifications.
function updateDownloads() {
	getDownloads().then(async (downloads) => {
		const unseenDownloads = await getUnseenDownloads(downloads)

		// Update badge.
		setBadge(unseenDownloads)

		// Detect state changes.
		chrome.storage.local.get('states').then(({ states: oldStates = [] }) => {
			const states = getStates(unseenDownloads)

			// Handle specific state changes.
			for (const [id, state] of states.entries()) {
				if (state === oldStates[id]) continue // Continue if state not changed.

				const currentDownload = unseenDownloads.find((dl) => dl.id === id)

				switch (state) {
					case Download.state.downloading:
						Notify.started(currentDownload)
						break

					case Download.state.paused:
						Notify.paused(currentDownload)
						break

					case Download.state.error:
						Notify.error(currentDownload)
						break

					case Download.state.complete:
						Notify.complete(currentDownload)
						break
				}
			}

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
				.then(() => console.info('Icon set', { folder }))
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
			console.info('Shelf set', { showShelf })
		})
}

// Sets the badge on the popup icon.
function setBadge(downloads) {
	const colors = {
		[Download.state.complete]: '#33993B',
		[Download.state.downloading]: '#3369d7',
		[Download.state.paused]: '#FFC247',
		[Download.state.error]: '#FE4134',
	}

	const dominantState = getDominantState(downloads)
	const completedDownloadsTotal = downloads.filter((dl) => dl.matchesStates(Download.state.complete)).length
	const activeDownloadsTotal = downloads.filter((dl) => dl.matchesStates(Download.state.downloading, Download.state.paused, Download.state.error, Download.state.complete)).length

	const text = activeDownloadsTotal <= 0 ? '' : dominantState === Download.state.complete ? activeDownloadsTotal.toString() : completedDownloadsTotal + '/' + activeDownloadsTotal

	chrome.action.setBadgeBackgroundColor({ color: colors[dominantState] })
	chrome.action.setBadgeText({ text })
}

// Returns a promise resolving to all downloads with any viewed completed downloads removed.
async function getUnseenDownloads(downloads) {
	const seen = Symbol()
	return (await Promise.all(downloads.map(async (dl) => ((await dl.isSeen()) ? seen : dl)))).filter((item) => item !== seen)
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
function getDominantState(downloads) {
	const priorities = [Download.state.downloading, Download.state.error, Download.state.paused]
	const states = downloads.map((dl) => dl.state)

	for (const state of priorities) {
		if (states.includes(state)) return state
	}

	return Download.state.complete
}