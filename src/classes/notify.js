import Download from './download'

export default class Notify {
	static started(download) {
		chrome.storage.sync.get('notify').then(({ notify: { onStart: allowed = false } }) => {
			if (!allowed) return
			showNotification(download, 'Download started')
		})
	}

	static paused(download) {
		chrome.storage.sync.get('notify').then(({ notify: { onPause: allowed = false } }) => {
			if (!allowed) return
			showNotification(download, 'Download paused')
		})
	}

	static error(download) {
		chrome.storage.sync.get('notify').then(({ notify: { onError: allowed = false } }) => {
			if (!allowed) return
			showNotification(download, 'An error occured while downloading')
		})
	}

	static complete(download) {
		chrome.storage.sync.get('notify').then(({ notify: { onComplete: allowed = false } }) => {
			if (!allowed) return
			showNotification(download, 'Download complete')
		})
	}
}

function showNotification(dl, message) {
	chrome.permissions.contains({ permissions: ['notifications'] }).then((allowed) => {
		if (!allowed) return

		chrome.notifications.create(dl.id.toString(), {
			type: 'basic',
			title: message,
			message: dl.name,
			iconUrl: '../images/download128.png',
			requireInteraction: dl.state === Download.state.error,
		})
	})
}
