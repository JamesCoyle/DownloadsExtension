<script>
	export let heading = ''
	export let buttons = []
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

	button {
		display: grid;
		justify-content: center;
		align-items: center;
		width: 2rem;
		height: 2rem;
		margin: 0.5rem;
		border-radius: 50%;
	}
</style>

<header>
	<h1>{heading}</h1>

	{#each buttons as button}
		<button title={button.description} on:click={button.action}>
			<svg width="16" height="16" viewBox="0 0 24 24">
				<path d={button.icon} />
			</svg>
		</button>
	{/each}
</header>
