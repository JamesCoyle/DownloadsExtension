<script>
	import { currentView } from './../stores/current-view'

	import Header from '../components/header.svelte'

	import { mdiClose, mdiAlertOutline, mdiCodeTags } from '@mdi/js'
	import { icoKofi, icoGithub } from './../custom-icons'
</script>

<Header
	heading="About"
	buttons={[
		{
			icon: mdiClose,
			description: 'Close information',
			action: () => currentView.close(),
		},
	]}
/>
<div class="scrollable">
	<a class="link-row" href="https://james-coyle.dev" target="_blank">
		<svg width="16" height="16" viewBox="0 0 24 24">
			<path d={mdiCodeTags} fill="currentColor" />
		</svg>
		<span>Developed by James Coyle</span>
	</a>
	<a class="link-row" href="https://github.com/JamesCoyle/DownloadsExtension" target="_blank">
		<svg width="16" height="16" viewBox="0 0 24 24">
			<path d={icoGithub} fill="currentColor" />
		</svg>
		<span>View source on GitHub</span>
	</a>
	<a class="link-row" href="https://github.com/JamesCoyle/DownloadsExtension/issues/new" target="_blank">
		<svg width="16" height="16" viewBox="0 0 24 24">
			<path d={mdiAlertOutline} fill="currentColor" />
		</svg>
		<span>Report an issue</span>
	</a>
</div>
<a class="bottom-button" href="https://ko-fi.com/jamescoyle" target="_blank">
	<svg width="16" height="16" viewBox="0 0 24 24">
		<path xmlns="http://www.w3.org/2000/svg" d={icoKofi} />
	</svg>
	<span>Support development</span>
</a>
