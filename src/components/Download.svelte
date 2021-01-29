<script>
	export let download;

	let icon;

	$: downloading = download.state === "in_progress";
	$: paused = download.paused;
	$: error = download.error;
	$: complete = download.state === "complete";

	$: filename = download.filename.split(/[\/\\]/).pop();
	$: progress = (download.bytesReceived / download.totalBytes) * 100;

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
		// cancel download if not complete
		if (download.state !== "complete") {
			chrome.downloads.cancel(download.id);
			return;
		}

		if (e.ctrlKey) {
			// delete file and remove from history
			chrome.downloads.removeFile(download.id, () => {
				// todo : check for error before erasing
				chrome.downloads.erase({ id: download.id });
			});
		} else {
			// clear download from history
			chrome.downloads.erase({ id: download.id });
		}
	}
</script>

<style>
	.download {
		position: relative;
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		width: 100%;
		height: 40px;
	}

	.download::before {
		content: "";
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		display: block;
		transform: translateX(var(--progress));
		transition: transform 500ms linear, opacity 250ms ease-out 1s;
		opacity: 0;
		z-index: -1;
	}

	.download.downloading::before {
		background-color: #3369d7;
		opacity: 1;
	}

	.download.paused::before {
		background-color: #99951e;
	}

	.download.error::before {
		background-color: #d73333;
		opacity: 1;
	}

	.download.complete::before {
		background-color: #33991e;
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

<div
	class="download"
	style="--progress: {progress}%"
	class:downloading
	class:paused
	class:error
	class:complete>
	<button class="file" title={filename} on:click={handleFileClick}>
		<img class="icon" src={icon} alt="" />{filename}
	</button>
	{#if paused || error}
		<button class="button" on:click={play}>
			<svg width="20" height="20" viewBox="0 0 24 24">
				<path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="currentColor" />
			</svg>
		</button>
	{:else if downloading}
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
