export default class Download {
	static state = {
		complete: 'complete',
		downloading: 'downloading',
		paused: 'paused',
		canceled: 'canceled',
		error: 'error',
		deleted: 'deleted',
	}

	constructor(dl) {
		this.id = dl.id
		this.name = dl.filename.split(/[\/\\]/).pop()
		this.progress = (dl.bytesReceived / dl.totalBytes) * 100
		this.progressStr = getByteProgress(dl.bytesReceived, dl.totalBytes)
		this.resumable = dl.canResume
		this.state = getState(dl)
	}

	// Returns true if the current download state matches any of the given states.
	matchesStates(...states) {
		return states.includes(this.state)
	}

	// Returns a promise which resolves to true if the user has seen the completed download in the popup.
	isSeen() {
		return chrome.storage.local.get('seen').then(({ seen }) => seen?.includes(this.id))
	}
}

// Returns a promise which resolves with all current active downloads ordered by their start time.
export function getDownloads() {
	return chrome.downloads.search({ orderBy: ['-startTime'] }).then((dls) => dls.filter((d) => d.filename && d.incognito == false).map((dl) => new Download(dl)))
}

// Determines the current state of the given download.
function getState(dl) {
	if (!dl.exists) return Download.state.deleted

	if (dl.error) {
		if (dl.error === 'USER_CANCELED') return Download.state.canceled
		return Download.state.error
	}

	if (dl.endTime) return Download.state.complete

	if (dl.paused) return Download.state.paused

	return Download.state.downloading
}

// Returns the byte progress of the download as a scaled string value.
function getByteProgress(received, total) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	const k = 1024
	let i = 0
	let r = 0
	let t = 0

	if (total !== 0) {
		i = Math.floor(Math.log(total) / Math.log(k))
		r = (received / Math.pow(k, i)).toFixed(1)
		t = (total / Math.pow(k, i)).toFixed(1)
	}

	return r + '/' + t + ' ' + sizes[i]
}
