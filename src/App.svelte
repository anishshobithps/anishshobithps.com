<script>
	import Intro from './components/Intro.svelte';
	import Section from './components/Section.svelte';
	import About from './sections/About.svelte';
	import './styles/global.css';

	const SECTIONS = ['about'];

	let displayStates = { about: false};

	Element.prototype.inViewport = function () {
		var { top, bottom } = this.getBoundingClientRect();
		var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
		return top - windowHeight <= 0 && bottom - windowHeight <= 0;
	}

	Element.prototype.hasPartInViewport = function () {
		var { top, height } = this.getBoundingClientRect();
		return (top + (height / 3)) <= (window.innerHeight || document.documentElement.clientHeight);
	} 

	Element.prototype.almostInViewport = function () {
		var { top, height } = this.getBoundingClientRect();
		return (top + (height / 1.5)) <= (window.innerHeight || document.documentElement.clientHeight);
	} 

	function sleep (ms) {
		return new Promise(r => setTimeout(r, ms));
	}

	async function checkSections () {
		for (let i = 0; i < SECTIONS.length; i++) {
			let id = SECTIONS[i];
			if (!displayStates[id] && document.getElementById(id).hasPartInViewport())
				displayStates = Object.defineProperty(displayStates, id, { value: true });
		}
	}

	async function animateIntroPage () {
		let intoContentElements = document.querySelectorAll('.pre-intro-content');
		for (let i = 0; i < intoContentElements.length; i++) {
			await sleep(200);
			intoContentElements[i].classList.remove('pre-intro-content');
		}

		await sleep(600);
		let socialCardElements = document.querySelectorAll('.pre-socialcard');
		for (let i = 0; i < socialCardElements.length; i++) {
			await sleep(200);
			socialCardElements[i].classList.remove('pre-socialcard');
		}
	}

	const onRefresh = () => {
		checkSections();
	};

	window.addEventListener('load', async () => {
		animateIntroPage();
		checkSections();
	});

	window.addEventListener('scroll', onRefresh);
	window.addEventListener('resize', onRefresh);
</script>

<div class="background position-fixed"/>

<Intro/>

<Section
	id="about"
	name="About me"
	display={displayStates.about}
>
	<About/>
</Section>

<div class="footer text-white font-changa">© Anish Shobith P S {new Date().getFullYear()}</div>

<style>
	.background {
		width: 100vw;
		height: 100vh;
		background: var(--background-color);
		background-size: cover;
		background-blend-mode: multiply;
	}

	.footer {
		color: var(--lighter-green);
		position: relative; 
		width: 100%;
		padding: 10px 0;
		font-size: 20px;
		text-align: center;
	}
</style>