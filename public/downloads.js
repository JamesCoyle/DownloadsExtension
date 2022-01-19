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

			if (complete) this.updateDownload(id, 'complete')
			else if (downloading) this.updateDownload(id, 'downloading')
			else if (paused) this.updateDownload(id, 'paused')
			else if (error && error.current !== 'USER_CANCELED') this.updateDownload(id, 'error')
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
		chrome.action.setBadgeBackgroundColor({ color: badgeColors[state] })
	}

	/**
	 * Update the text of the browser action badge
	 * @param {number} total The total number of downloads since last cleared
	 * @param {number} complete The total number of complete downloads since last cleared
	 */
	_updateBadgeText(total, complete) {
		if (total == 0) chrome.action.setBadgeText({ text: '' })
		else if (complete === total) chrome.action.setBadgeText({ text: complete.toString() })
		else chrome.action.setBadgeText({ text: complete + '/' + total })
	}
}
