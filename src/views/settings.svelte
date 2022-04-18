<script>
	import { theme, iconColor, defaultIconColor, showShelf, notify } from './../stores/settings'
	import { currentView } from './../stores/current-view'

	import IconButton from '../components/icon-button.svelte'
	import Header from '../components/header.svelte'

	import { mdiRestore } from '@mdi/js'
	import { icoKofi } from './../custom-icons'

	function updateIconColor(e) {
		$iconColor = e.target.value
	}

	function updatePermission() {
		// Request permission if any notification active otherwise remove.
		if (Object.values($notify).some((enabled) => enabled)) {
			chrome.permissions.request({ permissions: ['notifications'] })
		} else {
			chrome.permissions.remove({ permissions: ['notifications'] })
		}
	}
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
		min-height: 1.5rem;
		margin: 0.25rem 0.5rem;
		padding: 0.25rem 0.5rem;
	}

	input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
	}

	input[type='color'] {
		cursor: pointer;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
	}

	input[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
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
			<label for="icon">Icon color</label>
			<IconButton description="Reset color to default" icon={mdiRestore} action={() => iconColor.set('auto')} />
			<input type="color" name="icon-color" id="icon-color" value={$iconColor !== 'auto' ? $iconColor : $defaultIconColor} on:change={updateIconColor} />
		</div>
	</section>
	<section>
		<h2>Notifications</h2>
		<div class="setting-item">
			<label for="enable-start-notification">Download started</label>
			<input id="enable-start-notification" type="checkbox" on:change={updatePermission} bind:checked={$notify.onStart} />
		</div>
		<div class="setting-item">
			<label for="enable-paused-notification">Download paused</label>
			<input id="enable-paused-notification" type="checkbox" on:change={updatePermission} bind:checked={$notify.onPause} />
		</div>
		<div class="setting-item">
			<label for="enable-error-notification">Download error</label>
			<input id="enable-error-notification" type="checkbox" on:change={updatePermission} bind:checked={$notify.onError} />
		</div>
		<div class="setting-item">
			<label for="enable-complete-notification">Download completed</label>
			<input id="enable-complete-notification" type="checkbox" on:change={updatePermission} bind:checked={$notify.onComplete} />
		</div>
	</section>
</div>
<a class="bottom-button" href="https://ko-fi.com/jamescoyle" target="_blank">
	<svg width="16" height="16" viewBox="0 0 24 24">
		<path xmlns="http://www.w3.org/2000/svg" d={icoKofi} />
	</svg>
	<span>Support development</span>
</a>
