import { readable } from 'svelte/store'

import { getDownloads } from '../classes/download'

export const downloads = readable([], (set) => {
	const interval = setInterval(() => {
		getDownloads().then((dls) => set(dls))
	}, 500)

	return function stop() {
		clearInterval(interval)
	}
})
