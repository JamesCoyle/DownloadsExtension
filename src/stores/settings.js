import { writable } from 'svelte/store'

function createStore(key, initial) {
	const store = writable(initial)
	store.subscribe((val) => {
		console.log('Updated', key, val)
		chrome.storage.sync.set({ [key]: val })
	})
	return store
}

chrome.storage.sync.get(['theme', 'icon', 'showShelf']).then((items) => {
	theme.set(items.theme)
	icon.set(items.icon)
	showShelf.set(items.showShelf)
})

export const theme = createStore('theme', 'auto')
export const icon = createStore('icon', 'auto')
export const showShelf = createStore('showShelf', false)
export const notifyOnStart = createStore('notifyOnStart', false)
export const notifyOnComplete = createStore('notifyOnComplete', false)
export const notifyOnError = createStore('notifyOnError', false)
