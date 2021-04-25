<script>
	import Download from './components/Download.svelte'

	const settings = {
		theme: 'auto',
		notifyOnComplete: false,
		notifyOnError: false,
		showShelf: false,
	}

	const hints = ['Notifications can be enabled or disabled via the settings menu', 'Change the look and feel using the theme and icon switcher in the settings menu', 'Ctrl+Click on the downloaded file to open that file in a new tab', 'Shift+Click on the downloaded file to open the folder it is within', 'Ctrl+Click on the cross to delete the downloaded file and clear the download', 'Support development by <a href="https://www.buymeacoffee.com/JamesCoyle" target="_blank">donating</a>']

	let downloads = []
	let settingsPaneOpen = false

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
		chrome.runtime.sendMessage({ popupOpen: true })
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
		position: relative;
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
		width: 2rem;
		height: 2rem;
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

	.hint {
		position: absolute;
		bottom: 0;
		right: 0;
		left: 0;
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		padding: 1rem;
		flex: 0 0 3rem;
		color: #9aa0a6;
	}

	.hint svg {
		flex-shrink: 0;
		margin-right: 1rem;
	}
</style>

<main class={settings.theme}>
	{#if settingsPaneOpen}
		<header>
			<h1>Settings</h1>
			<button class="settings-button" on:click={() => (settingsPaneOpen = false)}>
				<svg width="16" height="16" viewBox="0 0 24 24">
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
		<a class="bottom-button" href="https://www.buymeacoffee.com/JamesCoyle" target="_blank">
			<svg width="16" height="16" viewBox="0 0 24 24">
				<path xmlns="http://www.w3.org/2000/svg" d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 01-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 00-1.322-.238c-.826 0-1.491.284-2.26.613z" />
			</svg>
			<span>Support development</span>
		</a>
	{:else}
		<header>
			<h1>Downloads</h1>
			<button class="settings-button" on:click={() => (settingsPaneOpen = true)}>
				<svg width="16" height="16" viewBox="0 0 24 24">
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
				<div class="hint">
					<svg width="16" height="16" viewBox="0 0 24 24">
						<path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
					</svg>
					<div>{@html hints[Math.floor(Math.random() * hints.length)]}</div>
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
