<script>
	import { theme } from './stores/settings'
	import { currentView } from './stores/current-view'

	import MainView from './views/main.svelte'
	import InfoView from './views/info.svelte'
	import SettingsView from './views/settings.svelte'

	// Update detected theme setting.
	chrome.storage.sync.set({
		detectedTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'default',
	})
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
		<MainView />
	{/if}
</main>
