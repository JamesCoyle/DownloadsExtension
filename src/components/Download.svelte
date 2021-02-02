<script>
	export let download

	let icon
	let state

	$: filename = download.filename.split(/[\/\\]/).pop()
	$: progress = (download.bytesReceived / download.totalBytes) * 100
	$: deleted = !download.exists

	// get icon
	chrome.downloads.getFileIcon(download.id, (i) => (icon = i))

	// get state from background process
	$: chrome.storage.local.get(download.id.toString(), (result) => {
		console.log(result)
		state = result[download.id]
	})

	// set state classes
	$: downloading = state === 'downloading'
	$: paused = state === 'paused'
	$: canceled = state === 'canceled'
	$: error = state === 'error'
	$: complete = state === 'complete'

	// remove download state if complete
	$: if (complete) chrome.storage.local.remove(download.id.toString())

	function handleFileClick(e) {
		if (e.ctrlKey) {
			chrome.tabs.create({
				url: 'file:///' + download.filename,
			})
		} else if (e.shiftKey) {
			chrome.downloads.show(download.id)
		} else {
			chrome.downloads.open(download.id)
		}
	}

	function play() {
		chrome.downloads.resume(download.id)
	}

	function pause() {
		chrome.downloads.pause(download.id)
	}

	function remove(e) {
		// cancel download if not complete
		if (state === 'downloading') {
			chrome.downloads.cancel(download.id)
			return
		}

		if (e.ctrlKey) {
			// delete file and remove from history
			chrome.downloads.removeFile(download.id, () => {
				// todo : check for error before erasing
				chrome.downloads.erase({ id: download.id })
			})
		} else {
			// clear download from history
			chrome.downloads.erase({ id: download.id })
		}
	}
</script>

<style>
	@keyframes complete {
		0%,
		50% {
			background-color: #33991e;
		}
		25%,
		75% {
			background-color: transparent;
		}
	}

	.download {
		position: relative;
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		width: 100%;
		height: 40px;
	}

	.download::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		display: block;
		width: 100%;
		height: 100%;
		background-color: transparent;
		transform: translateX(var(--progress));
		transition: transform 500ms linear, background-color 250ms ease-out 1s;
		opacity: 0.5;
		z-index: -1;
	}

	.download.downloading::before {
		background-color: #3369d7;
	}

	.download.paused::before {
		background-color: #99951e;
	}

	.download.error::before {
		background-color: #d73333;
	}

	.download.complete::before {
		animation: complete 1s;
	}

	.file {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		flex: 1 1 auto;
		height: 100%;
		padding: 0 1rem;
		overflow: hidden;
	}

	.icon {
		width: 1rem;
		height: 1rem;
		margin-right: 1rem;
		vertical-align: middle;
	}

	.file-info {
		overflow: hidden;
	}

	.filename {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.download.deleted .filename {
		text-decoration: line-through;
	}

	.state {
		opacity: 0.6;
		text-transform: capitalize;
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

<div class="download" class:downloading class:paused class:error class:complete class:deleted style="--progress: {progress}%">
	<button class="file" title={filename} data-state={state} on:click={handleFileClick}>
		<img class="icon" src={icon} alt="" />
		<div class="file-info">
			<div class="filename">{filename}</div>
			{#if state}
				<div class="state">{state}</div>
			{/if}
		</div>
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
			<path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor" />
		</svg>
	</button>
</div>
