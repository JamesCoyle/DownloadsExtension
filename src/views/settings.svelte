<script>
	import { theme, icon, showShelf, notifyOnComplete, notifyOnError, notifyOnStart } from './../stores/settings'
	import { currentView } from './../stores/current-view'

	import Header from './../components/header.svelte'

	import { icoKofi } from './../custom-icons'

	// function updateNotifyPreference({ target: { checked: enable, name: type } }) {
	// if (enable) {
	// requestNotificationPermission(
	// () => chrome.storage.sync.set({ [type]: true }),
	// () => {
	// alert('Notifications permission must be granted to enable notifications')
	// event.target.checked = false
	// }
	// )
	// } else {
	// chrome.storage.sync.set({ [type]: false })
	// }
	// }
	//
	// function updateShelfPreference(event) {
	// chrome.storage.sync.set({ showShelf: event.target.checked })
	// }
</script>

<style>
	section:not(:last-child) {
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--hover-color);
	}

	h2 {
		margin: 1rem 1rem 0.75rem 1rem;
		font-size: 1rem;
		font-weight: lighter;
	}

	label {
		flex: 1;
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
	<section>
		<h2>General</h2>
		<div class="setting-item">
			<label for="enable-shelf">Show download shelf</label>
			<input id="enable-shelf" type="checkbox" bind:checked={$showShelf} />
		</div>
	</section>
	<section>
		<h2>Appearance</h2>
		<div class="setting-item">
			<label for="theme-mode">Theme</label>
			<select name="theme-mode" id="theme-mode" bind:value={$theme}>
				<option value="auto">Auto detect</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</div>
		<div class="setting-item">
			<label for="icon">Icon</label>
			<select name="icon" id="icon" bind:value={$icon}>
				<option value="auto">Match theme</option>
				<option value="default">Blue</option>
				<option value="light">Dark Gray</option>
				<option value="dark">White</option>
			</select>
		</div>
	</section>
	<section>
		<h2>Notifications</h2>
		<div class="setting-item">
			<label for="enable-start-notification">Download started</label>
			<input id="enable-start-notification" type="checkbox" name="notifyOnError" bind:checked={$notifyOnStart} />
		</div>
		<div class="setting-item">
			<label for="enable-complete-notification">Download completed</label>
			<input id="enable-complete-notification" type="checkbox" name="notifyOnComplete" bind:checked={$notifyOnComplete} />
		</div>
		<div class="setting-item">
			<label for="enable-error-notification">Error downloading</label>
			<input id="enable-error-notification" type="checkbox" name="notifyOnError" bind:checked={$notifyOnError} />
		</div>
	</section>
</div>
<a class="bottom-button" href="https://ko-fi.com/jamescoyle" target="_blank">
	<svg width="16" height="16" viewBox="0 0 24 24">
		<path xmlns="http://www.w3.org/2000/svg" d={icoKofi} />
	</svg>
	<span>Support development</span>
</a>
