<script>
	import settings from './stores/settings'
	import currentView from './stores/current-view'

	import MainView from './views/main.svelte'
	import InfoView from './views/info.svelte'
	import SettingsView from './views/settings.svelte'

	let downloads = []

	// connect to background script
	const connection = chrome.extension.connect()

	// get localstorage and keep up to date on changes
	chrome.storage.local.get(null, updateStoredValues)
	chrome.storage.local.onChanged.addListener((changes) => {
		Object.keys(changes).map((key) => {
			changes[key] = changes[key].newValue
		})
		updateStoredValues(changes)
	})

	// update preffered color scheme
	chrome.storage.local.set({
		preferedTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'default',
	})

	// poll for list changes
	setInterval(updateDownloadList, 500)

	// populate downloads on first load
	updateDownloadList()

	/**
	 * Update any local values from the localstorage
	 * @param param0 an object with values stored in localstorage
	 */
	function updateStoredValues({ theme, notifyOnComplete, notifyOnError, showShelf }) {
		settings.theme = theme ?? settings.theme
		settings.notifyOnComplete = notifyOnComplete ?? settings.notifyOnComplete
		settings.notifyOnError = notifyOnError ?? settings.notifyOnError
		settings.showShelf = showShelf ?? settings.showShelf
	}

	function updateDownloadList() {
		chrome.downloads.search({ limit: 100, orderBy: ['-startTime'] }, (d) => {
			downloads = d.filter((d) => d.filename && d.incognito == false)
		})

		// notify background to keep clearing complete downloads
		connection.postMessage('Still alive')
	}

	function requestNotificationPermission(success, rejected) {
		chrome.permissions.request(
			{
				permissions: ['notifications'],
			},
			(granted) => {
				if (granted) success()
				else rejected()
			}
		)
	}
</script>

<style>
	main {
		display: flex;
		flex-flow: column nowrap;
		height: 100%;
	}
</style>

<main class={settings.theme}>
	{#if $currentView === 'settings'}
		<SettingsView />
	{:else if $currentView === 'info'}
		<InfoView />
	{:else}
		<MainView {downloads} />
	{/if}
</main>
