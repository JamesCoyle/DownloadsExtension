import { writable } from 'svelte/store'

function createCurrentViewStore() {
	const { subscribe, set } = writable('')

	return {
		subscribe,
		showSettings() {
			set('settings')
		},
		showInfo() {
			set('info')
		},
		close() {
			set('')
		},
	}
}

export const currentView = createCurrentViewStore()
