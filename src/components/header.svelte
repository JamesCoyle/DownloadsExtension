<script>
	export let heading = ''
	export let buttons = []

	import IconButton from './icon-button.svelte'
</script>

<style>
	header {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		flex: 0 0 40px;

		font-size: 1rem;
		font-weight: normal;

		border-bottom: 1px solid var(--hover-color);
	}

	h1 {
		flex: 1 1 auto;
		margin: 0 1rem;
		font: inherit;
	}
</style>

<header>
	<h1>{heading}</h1>

	{#each buttons as button}
		<IconButton description={button.description} action={button.action} icon={button.icon} />
	{/each}
</header>
