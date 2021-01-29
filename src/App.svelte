<script>
	import Download from "./components/Download.svelte";

	let downloads = [];

	function updateDownloadList() {
		chrome.downloads.search({}, (d) => {
			downloads = d.filter((d) => d.filename);
			console.log(downloads);
		});
	}

	function openDownloadsTab() {
		const tab = { url: "chrome://downloads" };
		chrome.tabs.create(tab);
	}

	// allow background to detect when popup open
	chrome.runtime.connect({ name: "popup" });

	// update the download list when events fire
	chrome.downloads.onCreated.addListener(updateDownloadList);
	chrome.downloads.onChanged.addListener(updateDownloadList);
	chrome.downloads.onErased.addListener(updateDownloadList);

	// poll for list changes
	setInterval(updateDownloadList, 500);

	// populate downloads on first load
	updateDownloadList();
</script>

<style>
	.flex {
		display: flex;
		flex-flow: column nowrap;
		height: 100%;
	}

	.header {
		flex: 0 0 40px;
		padding: 1rem 1rem 0.25rem 1rem;
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
		border-top: 1px solid hsla(0, 0%, 100%, 0.15);
		outline: none;
	}

	.button svg {
		margin-right: 1rem;
	}
</style>

<div class="flex">
	<h1 class="header">Downloads</h1>

	<div class="scrollable">
		{#each downloads as download (download.id)}
			<Download {download} />
		{/each}
	</div>

	<button class="button" on:click={openDownloadsTab}>
		<svg width="16" height="16" viewBox="0 0 24 24">
			<path
				d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"
				fill="currentColor" />
		</svg>
		<span>Manage downloads</span>
	</button>
</div>
