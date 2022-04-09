import { writable } from 'svelte/store'

function subscribe(store, key, value) {
	store.set(value)
	store.subscribe((val) => {
		chrome.storage.sync.set({ [key]: val })
	})
}

export const showShelf = writable(false)
export const theme = writable('auto')
export const icon = writable('auto')
export const notify = writable({ onStart: false, onPause: false, onError: false, onComplete: false })

// Populate stores with values from chrome storage
chrome.storage.sync.get(['theme', 'icon', 'showShelf', 'notify']).then((items) => {
	subscribe(showShelf, 'showShelf', items.showShelf)
	subscribe(theme, 'theme', items.theme)
	subscribe(icon, 'icon', items.icon)
	subscribe(notify, 'notify', items.notify)
})
