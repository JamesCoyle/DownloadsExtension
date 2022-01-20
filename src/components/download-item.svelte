<script>
	import { modifierKeys } from '../stores/modifier-keys'
	import { mdiDownload, mdiPause, mdiClose, mdiFolder, mdiDelete, mdiOpenInNew } from '@mdi/js'

	import Download from '../classes/download'

	export let download

	let icon

	$: buttons = [
		{
			description: 'Resume download',
			icon: mdiDownload,
			action() {
				chrome.downloads.resume(download.id)
			},
			condition() {
				return download.resumable
			},
		},
		{
			description: 'Pause download',
			icon: mdiPause,
			action() {
				chrome.downloads.pause(download.id)
			},
			condition() {
				return download.matchesStates(Download.state.downloading)
			},
		},

		{
			description: 'Open in folder',
			icon: mdiFolder,
			action() {
				chrome.downloads.show(download.id)
			},
			condition() {
				return download.matchesStates(Download.state.complete) && $modifierKeys.ctrl === false
			},
		},
		{
			description: 'Open in browser',
			icon: mdiOpenInNew,
			action() {
				chrome.tabs.create({
					url: 'file:///' + download.filename,
				})
			},
			condition() {
				return download.matchesStates(Download.state.complete) && $modifierKeys.ctrl === true
			},
		},

		{
			description: 'Cancel download',
			icon: mdiClose,
			action() {
				chrome.downloads.cancel(download.id)
			},
			condition() {
				return download.matchesStates(Download.state.downloading, Download.state.error, Download.state.paused)
			},
		},
		{
			description: 'Clear download',
			icon: mdiClose,
			action() {
				chrome.downloads.erase({ id: download.id })
			},
			condition() {
				return download.matchesStates(Download.state.complete, Download.state.canceled) && $modifierKeys.ctrl === false
			},
		},
		{
			description: 'Delete download',
			icon: mdiDelete,
			action() {
				chrome.downloads.removeFile(download.id).then(() => chrome.downloads.erase({ id: download.id }))
			},
			condition() {
				return download.matchesStates(Download.state.complete) && $modifierKeys.ctrl === true
			},
		},
	]

	// get icon
	chrome.downloads.getFileIcon(download.id, (i) => {
		icon = i
	})

	function handleFileClick(e) {
		// todo : handle click on file which is errored/incomplete
		chrome.downloads.open(download.id)
	}
</script>

<style>
	@keyframes complete {
		0%,
		50% {
			background-color: #33993b;
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
		z-index: 1;
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
		transition: transform 500ms linear, background-color 100ms ease-out;
		opacity: 0.5;
		z-index: -1;
	}

	.download.downloading::before {
		background-color: #3369d7;
	}

	.download.paused::before {
		background-color: #ffc247;
	}

	.download.error::before {
		background-color: #fe4134;
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
		font-size: 0.8em;
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

<div class="download {download.state}" style="--progress: {download.progress}%">
	<button class="file" title={download.name} data-state={download.state} on:click={handleFileClick}>
		<img class="icon" src={icon} alt="" />
		<div class="file-info">
			<div class="filename">{download.name}</div>
			<div class="state">
				{#if download.matchesStates(Download.state.downloading)}
					{download.progressStr}
				{:else if !download.matchesStates(Download.state.complete)}
					{download.state}
				{/if}
			</div>
		</div>
	</button>

	{#each buttons as button}
		{#if button.condition()}
			<button class="button" title={button.description} on:click={button.action}>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<path d={button.icon} fill="currentColor" />
				</svg>
			</button>
		{/if}
	{/each}
</div>
