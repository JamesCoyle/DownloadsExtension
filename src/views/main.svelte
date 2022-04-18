<script>
	import { currentView } from './../stores/current-view'
	import { downloads } from './../stores/downloads'

	import Header from '../components/header.svelte'
	import DownloadItem from '../components/download-item.svelte'

	import { mdiInformationOutline, mdiCog } from '@mdi/js'

	const hints = ['Notifications can be enabled or disabled via the settings menu', 'Change the look and feel using the theme and icon switcher in the settings menu', 'Hold Ctrl to change the secondary actions for each download', 'Support development by <a href="https://ko-fi.com/jamescoyle" target="_blank">donating</a>']

	function openDownloadsTab() {
		chrome.tabs.create({ url: 'chrome://downloads' })
	}
</script>

<style>
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

<Header
	heading="Downloads"
	buttons={[
		{
			icon: mdiInformationOutline,
			description: 'Open info',
			action: () => currentView.showInfo(),
		},
		{
			icon: mdiCog,
			description: 'Open settings',
			action: () => currentView.showSettings(),
		},
	]}
/>

<div class="scrollable">
	{#each $downloads as download (download.id)}
		<DownloadItem {download} />
	{:else}
		<div class="center">
			<img width="160" height="160" src="images/no-downloads.svg" alt="" />
			<p>Files you download appear here</p>
		</div>
		<div class="hint">
			<svg width="16" height="16" viewBox="0 0 24 24">
				<path d={mdiInformationOutline} />
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
