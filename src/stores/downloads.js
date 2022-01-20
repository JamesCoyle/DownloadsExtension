import { readable } from 'svelte/store'

import Download, { getDownloads } from '../classes/download'

export const downloads = readable([], (set) => {
	const interval = setInterval(() => fetch(set), 500)
	fetch(set)

	return function stop() {
		clearInterval(interval)
	}
})

function fetch(set) {
	getDownloads().then((dls) => {
		set(dls)

		// Update seen downloads list.
		chrome.storage.local.set({
			seen: dls.filter((dl) => dl.matchesStates(Download.state.complete)).map((dl) => dl.id),
		})
	})
}
