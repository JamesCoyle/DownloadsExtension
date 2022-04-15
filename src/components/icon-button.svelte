<script>
	export let description
	export let action
	export let icon
</script>

<style>
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

<button title={description} on:click={action}>
	<svg width="16" height="16" viewBox="0 0 24 24">
		<path d={icon} />
	</svg>
</button>
