export default class Download {
	static state = {
		complete: 'complete',
		downloading: 'downloading',
		paused: 'paused',
		error: 'error',
		deleted: 'deleted',
	}

	constructor(dl) {
		this.id = dl.id
		this.name = dl.filename.split(/[\/\\]/).pop()
		this.progress = (dl.bytesReceived / dl.totalBytes) * 100
		this.progressStr = getByteProgress(dl.bytesReceived, dl.totalBytes)
		this.state = getState(dl)
	}

	matchesStates(...states) {
		return states.includes(this.state)
	}
}

function getState(dl) {
	if (!dl.exists) return Download.state.deleted
	if (dl.error) return Download.state.error
	if (dl.endTime) return Download.state.complete
	if (dl.paused) return Download.state.paused
	return Download.state.downloading
}

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
