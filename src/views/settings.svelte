<script>
	import settings from './../stores/settings'
	import currentView from './../stores/current-view'

	import Header from './../components/header.svelte'

	import { icoKofi } from './../custom-icons'

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
</script>

<style>
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

	.setting-item {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
		align-items: center;
		min-height: 3rem;
		padding: 0 0.5rem;

		border-bottom: 1px solid var(--hover-color);
	}
</style>

<Header
	heading="Settings"
	buttons={[
		{
			icon: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
			description: 'Close settings',
			action: () => currentView.close(),
		},
	]}
/>

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
<a class="bottom-button" href="https://ko-fi.com/jamescoyle" target="_blank">
	<svg width="16" height="16" viewBox="0 0 24 24">
		<path xmlns="http://www.w3.org/2000/svg" d={icoKofi} />
	</svg>
	<span>Support development</span>
</a>
