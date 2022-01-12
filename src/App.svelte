<script>
	import { theme } from './stores/settings'
	import { currentView } from './stores/current-view'

	import MainView from './views/main.svelte'
	import InfoView from './views/info.svelte'
	import SettingsView from './views/settings.svelte'

	let downloads = []

	// Update detected theme setting.
	chrome.storage.sync.set({
		detectedTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'default',
	})

	// poll for list changes
	// setInterval(updateDownloadList, 500)

	// populate downloads on first load
	// updateDownloadList()

	// Update settings store with latest values.
	// function updateSettings({ theme, notifyOnComplete, notifyOnError, showShelf }) {
	// settings.theme = theme ?? settings.theme
	// settings.notifyOnComplete = notifyOnComplete ?? settings.notifyOnComplete
	// settings.notifyOnError = notifyOnError ?? settings.notifyOnError
	// settings.showShelf = showShelf ?? settings.showShelf
	// }

	// function updateDownloadList() {
	// chrome.downloads.search({ limit: 100, orderBy: ['-startTime'] }, (d) => {
	// downloads = d.filter((d) => d.filename && d.incognito == false)
	// })
	//
	// notify background to keep clearing complete downloads
	// chrome.runtime.sendMessage({ popupOpen: true })
	// }

	// function requestNotificationPermission(success, rejected) {
	// chrome.permissions.request(
	// {
	// permissions: ['notifications'],
	// },
	// (granted) => {
	// if (granted) success()
	// else rejected()
	// }
	// )
	// }
</script>

<style>
	main {
		display: flex;
		flex-flow: column nowrap;
		height: 100%;
	}
</style>

<main class={$theme}>
	{#if $currentView === 'settings'}
		<SettingsView />
	{:else if $currentView === 'info'}
		<InfoView />
	{:else}
		<MainView {downloads} />
	{/if}
</main>
