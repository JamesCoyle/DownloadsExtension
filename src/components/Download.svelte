<script>
	export let download;

	let icon;

	$: canPlay = download.paused;
	$: canPause = download.state === "in_progress";

	$: filename = download.filename.split(/[\/\\]/).pop();

	chrome.downloads.getFileIcon(download.id, (i) => (icon = i));

	function handleFileClick(e) {
		if (e.ctrlKey) {
			chrome.tabs.create({
				url: "file:///" + download.filename,
			});
		} else if (e.shiftKey) {
			chrome.downloads.show(download.id);
		} else {
			chrome.downloads.open(download.id);
		}
	}

	function play() {
		console.log("Play");
		chrome.downloads.resume(download.id);
	}

	function pause() {
		console.log("Pause");

		chrome.downloads.pause(download.id);
	}

	function remove(e) {
		if (e.ctrlKey) {
			chrome.downloads.removeFile(download.id);
		}

		chrome.downloads.erase({ id: download.id });
	}
</script>

<style>
	.download {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		width: 100%;
		height: 40px;
	}

	.file {
		flex: 1 1 auto;
		height: 100%;
		padding: 0 1rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.icon {
		width: 1rem;
		height: 1rem;
		margin-right: 1rem;
		vertical-align: middle;
	}

	.button {
		display: flex;
		justify-content: center;
		align-items: center;
		flex: 0 0 40px;
		height: 40px;
		opacity: 0.8;
	}
</style>

<div class="download">
	<button class="file" on:click={handleFileClick}>
		<img class="icon" src={icon} alt="" />{filename}
	</button>
	{#if canPlay}
		<button class="button" on:click={play}>
			<svg width="20" height="20" viewBox="0 0 24 24">
				<path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="currentColor" />
			</svg>
		</button>
	{:else if canPause}
		<button class="button" on:click={pause}>
			<svg width="20" height="20" viewBox="0 0 24 24">
				<path d="M14,19H18V5H14M6,19H10V5H6V19Z" fill="currentColor" />
			</svg>
		</button>
	{/if}
	<button class="button" on:click={remove}>
		<svg width="20" height="20" viewBox="0 0 24 24">
			<path
				d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
				fill="currentColor" />
		</svg>
	</button>
</div>
