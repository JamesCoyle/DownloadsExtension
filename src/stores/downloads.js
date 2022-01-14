import { readable } from 'svelte/store'

import Download from '../classes/download'

export const downloads = readable([], (set) => {
	const interval = setInterval(() => {
		chrome.downloads.search({ limit: 100, orderBy: ['-startTime'] }, (downloads) => {
			set(downloads.filter((d) => d.filename && d.incognito == false).map((dl) => new Download(dl)))
		})
	}, 500)

	return function stop() {
		clearInterval(interval)
	}
})
