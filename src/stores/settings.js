import { writable } from 'svelte/store'

export default {
	theme: writable('auto'),
	notifyOnComplete: writable(false),
	notifyOnError: writable(false),
	showShelf: writable(false),
}
