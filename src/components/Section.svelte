<script>
	export let id, display, name;
</script>

<div class="section font-changa text-white {id}" {id}>
	{#if display}
		<div class="section-inner">
			<h1 class="section-title m-0">
				<span>{name}</span>
			</h1>
			
			<slot></slot>
		</div>
	{/if}
</div>

<style>
	.section {
		position: relative;
		min-height: 100vh;
		width: 100%;
		background-color: var(--background-color);
	}

	.section-title span {
		color: var(--green);
	}

	.section-title::after {
		content: "";
		display: block;
		background-color: var(--light-grey);
		height: 2px;
		width: 100%;
		margin-top: -10px;
		margin-bottom: 10px;
	}

	.section-inner {
		padding: 10vw 7vw;
		width: 85vw;
		margin: auto;
		animation: section-animation 1s forwards;
	}
</style>