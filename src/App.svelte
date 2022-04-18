<script>
	import { theme, defaultIconColor } from './stores/settings'
	import { currentView } from './stores/current-view'

	import MainView from './views/main.svelte'
	import InfoView from './views/info.svelte'
	import SettingsView from './views/settings.svelte'

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		if (!e.matches) return
		defaultIconColor.set('#f1f3f4')
	})

	window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
		if (!e.matches) return
		defaultIconColor.set('#5f6368')
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
