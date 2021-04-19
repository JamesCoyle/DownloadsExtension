<script>
	import Download from './components/Download.svelte'

	let downloads = []
	let settingsPaneOpen = false

	let settings = {
		theme: 'auto',
		notifyOnComplete: false,
		notifyOnError: false,
		showShelf: false,
	}

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
		chrome.downloads.search({}, (d) => {
			downloads = d.filter((d) => d.filename && d.incognito == false)
		})

		// notify background to keep clearing complete downloads
		connection.postMessage('Still alive')
	}

	function updateNotifyPreference({ target: { checked: enable, name: type } }) {
		if (enable) {
			requestNotificationPermission(
				() => chrome.storage.local.set({ [type]: true }),
				() => {
					alert('Notifications permission must be granted to enable notifications')
					event.target.checked = false
				}
			)
		} else {
			chrome.storage.local.set({ [type]: false })
		}
	}

	function updateShelfPreference(event) {
		chrome.storage.local.set({ showShelf: event.target.checked })
	}

	function updateThemePreference(event) {
		chrome.storage.local.set({ theme: event.target.value })
	}

	function updateIconPreference(event) {
		chrome.storage.local.set({ icon: event.target.value })
	}

	function openDownloadsTab() {
		chrome.tabs.create({ url: 'chrome://downloads' })
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

	h1 {
		flex: 1 1 auto;
		margin: 0 1rem;
		font: inherit;
	}

	svg {
		fill: currentColor;
	}

	label {
		padding: 0 0.5rem;
	}

	input,
	select {
		margin: 0.25rem 0.5rem;
		padding: 0.25rem 0.5rem;
	}

	input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
	}

	header {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		flex: 0 0 40px;

		font-size: 1rem;
		font-weight: normal;

		border-bottom: 1px solid var(--hover-color);
	}

	.scrollable {
		flex: 1 1 auto;
		overflow-x: hidden;
		overflow-y: scroll;
	}

	.bottom-button {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		flex: 0 0 40px;
		padding: 1rem;
		color: inherit;
		text-align: left;
		background-color: transparent;
		border: none;
		border-top: 1px solid var(--hover-color);
		outline: none;
	}

	.bottom-button svg {
		margin-right: 1rem;
	}

	.settings-button {
		display: grid;
		justify-content: center;
		align-items: center;
		width: 3rem;
		height: 3rem;
		margin: 0.5rem;
		border-radius: 50%;
	}

	.setting-item {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
		align-items: center;
		min-height: 3rem;
		padding: 0 0.5rem;

		border-bottom: 1px solid var(--hover-color);
	}

	.center {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: #9aa0a6;
		font-weight: bold;
		text-align: center;
		pointer-events: none;
		user-select: none;
	}
</style>

<main class={settings.theme}>
	{#if settingsPaneOpen}
		<header>
			<h1>Settings</h1>
			<button class="settings-button" on:click={() => (settingsPaneOpen = false)}>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
				</svg>
			</button>
		</header>
		<div class="scrollable">
			<div class="setting-item">
				<label for="enable-complete-notification">Notify on complete</label>
				<input id="enable-complete-notification" type="checkbox" name="notifyOnComplete" checked={settings.notifyOnComplete} on:change={updateNotifyPreference} />
			</div>
			<div class="setting-item">
				<label for="enable-error-notification">Notify on error</label>
				<input id="enable-error-notification" type="checkbox" name="notifyOnError" checked={settings.notifyOnError} on:change={updateNotifyPreference} />
			</div>
			<div class="setting-item">
				<label for="enable-shelf">Show download shelf</label>
				<input id="enable-shelf" type="checkbox" checked={settings.showShelf} on:change={updateShelfPreference} />
			</div>
			<div class="setting-item">
				<label for="theme-mode">Theme</label>
				<select name="theme-mode" id="theme-mode" on:input={updateThemePreference}>
					<option value="auto" selected={settings.theme === 'auto'}>Auto detect</option>
					<option value="light" selected={settings.theme === 'light'}>Light</option>
					<option value="dark" selected={settings.theme === 'dark'}>Dark</option>
				</select>
			</div>
			<div class="setting-item">
				<label for="icon">Icon</label>
				<select name="icon" id="icon" on:input={updateIconPreference}>
					<option value="auto" selected={settings.icon === 'auto'}>Match theme</option>
					<option value="default" selected={settings.icon === 'default'}>Blue</option>
					<option value="light" selected={settings.icon === 'light'}>Dark Gray</option>
					<option value="dark" selected={settings.icon === 'dark'}>White</option>
				</select>
			</div>
		</div>
	{:else}
		<header>
			<h1>Downloads</h1>
			<button class="settings-button" on:click={() => (settingsPaneOpen = true)}>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
				</svg>
			</button>
		</header>

		<div class="scrollable">
			{#each downloads as download (download.id)}
				<Download {download} />
			{:else}
				<div class="center">
					<img width="160" height="160" src="images/no-downloads.svg" alt="" />
					<p>Files you download appear here</p>
				</div>
			{/each}
		</div>

		<button class="bottom-button" on:click={openDownloadsTab}>
			<svg width="16" height="16" viewBox="0 0 24 24">
				<path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" fill="currentColor" />
			</svg>
			<span>Manage downloads</span>
		</button>
	{/if}
</main>
