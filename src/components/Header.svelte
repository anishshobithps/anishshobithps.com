<script>
	export let scrolledHeader;

	function scrollNavigationHandler (id) {
		return () => {
			let top = (
				document.getElementById(id).getBoundingClientRect().top - 
				document.body.getBoundingClientRect().top
			);

			window.scrollTo({ top, behavior: 'smooth' });
		};
	}

	function scrollToTop () {
		window.scrollTo({ top: 0, behaviour: 'smooth' });
	}
</script>

<div class="header font-changa text-white position-fixed {scrolledHeader ? 'scrolled-header' : ''}">
	<span class="pre-header-content" style="display: inline-block;">
		<h2>Anish Shobith P S</h2>
	</span>

	<span class="buttons">
		<button class="pre-header-content" on:click={scrollToTop}>Home</button>
		<button class="pre-header-content" on:click={scrollNavigationHandler('about')}>About</button>
	</span>
</div>

<style>
	.header {
		width: calc(100vw - 80px);
		padding: 5px 40px;
		z-index: 10;
	}

	h2 {
		margin: 0;
		font-weight: lighter;
		font-size: 30px;
	}

	button {
		outline: none;
		border: none;
		display: inline-block;
		cursor: pointer;
		margin-top: 18px;
		background: transparent;
		color: white;
		text-transform: uppercase;
		font-weight: bolder;
		font-size: 15px;
	}

	button:hover {
		color: var(--blue);
	}

	.buttons {
		float: right;
	}

	:global(.pre-header-content) {
		opacity: 0;
	}

	:global(.header *:not(.pre-header-content)) {
		animation: header-content-animation .5s forwards;
	}

	:global(.scrolled-header) {
		background-color: var(--header-color);
		padding: 5px 20px;
		width: calc(100vw - 40px);
	}
	
	@media (max-width: 600px) {
		.header {
			padding: 10px 7vw;
			width: calc(100% - 20px);
		}

		h2 { display: none; }
		.buttons { float: left; }
		.scrolled-header { display: none; }
	}
</style>