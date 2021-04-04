<script>
	import Download from './components/Download.svelte'

	let downloads = []
	let settings = false

	function updateDownloadList() {
		chrome.downloads.search({}, (d) => {
			downloads = d.filter((d) => d.filename && d.incognito == false)
		})
	}

	function openDownloadsTab() {
		const tab = { url: 'chrome://downloads' }
		chrome.tabs.create(tab)
	}

	function updateNotificationPreference(event) {
		chrome.storage.local.set({ notificationsEnabled: event.target.checked })
	}

	function updateThemePreference(event) {
		chrome.storage.local.set({ theme: event.target.value })
	}

	// set icon to match browser theme
	const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'default'

	chrome.browserAction.setIcon({
		path: {
			16: `icons/${theme}/icon-16.png`,
			24: `icons/${theme}/icon-24.png`,
			32: `icons/${theme}/icon-32.png`,
			48: `icons/${theme}/icon-48.png`,
		},
	})

	// allow background to detect when popup open
	chrome.runtime.connect({ name: 'popup' })

	// update the download list when events fire
	chrome.downloads.onCreated.addListener(updateDownloadList)
	chrome.downloads.onChanged.addListener(updateDownloadList)
	chrome.downloads.onErased.addListener(updateDownloadList)

	// poll for list changes
	setInterval(updateDownloadList, 500)

	// populate downloads on first load
	updateDownloadList()
</script>

<style>
	main {
		display: flex;
		flex-flow: column nowrap;
		height: 100%;
	}

	h1 {
		flex: 1 1 auto;
		padding: 1rem 1rem 0.25rem 1rem;
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
		margin: 0.5rem;
		padding: 0.5rem;
	}

	input[type='checkbox'] {
		width: 1.5rem;
		height: 1.5rem;
	}

	.header {
		display: flex;
		flex-flow: row nowrap;
		flex: 0 0 40px;
		font-size: 1rem;
		font-weight: normal;
	}

	.scrollable {
		flex: 1 1 auto;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.button {
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

	.button svg {
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
		margin-bottom: 0.5rem;
		padding: 0.5rem;
		font-size: 1.25rem;
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

<main>
	<div class="header">
		<h1>Downloads</h1>
		<button class="settings-button" on:click={() => (settings = !settings)}>
			<svg width="24" height="24" viewBox="0 0 24 24">
				{#if settings}
					<path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
				{:else}
					<path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
				{/if}
			</svg>
		</button>
	</div>

	<div class="scrollable">
		{#if settings}
			<div class="setting-item">
				<label for="enable-notification">Notify on complete</label>
				<input id="enable-notification" type="checkbox" on:change={updateNotificationPreference} />
			</div>
			<div class="setting-item">
				<label for="theme-mode">Theme</label>
				<select name="theme-mode" id="theme-mode" on:blur={updateThemePreference}>
					<option value="auto">Auto detect</option>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
				</select>
			</div>
		{:else}
			{#each downloads as download (download.id)}
				<Download {download} />
			{:else}
				<div class="center">
					<img width="160" height="160" src="images/no-downloads.svg" alt="" />
					<p>Files you download appear here</p>
				</div>
			{/each}
		{/if}
	</div>

	<div class="settings" />

	<button class="button" on:click={openDownloadsTab}>
		<svg width="16" height="16" viewBox="0 0 24 24">
			<path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" fill="currentColor" />
		</svg>
		<span>Manage downloads</span>
	</button>
</main>
