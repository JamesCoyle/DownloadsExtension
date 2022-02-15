import { writable } from 'svelte/store'

function createStore(key, initial) {
	const store = writable(initial)
	store.subscribe((val) => {
		chrome.storage.sync.set({ [key]: val })
	})
	return store
}

chrome.storage.sync.get(['theme', 'icon', 'showShelf', 'notify']).then((items) => {
	showShelf.set(items.showShelf)
	theme.set(items.theme)
	icon.set(items.icon)
	notify.set(items.notify)
})

export const showShelf = createStore('showShelf', false)
export const theme = createStore('theme', 'auto')
export const icon = createStore('icon', 'auto')
export const notify = createStore('notify', { onStart: false, onPause: false, onError: false, onComplete: false })
