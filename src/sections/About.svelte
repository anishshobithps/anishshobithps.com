<script>
	import { ProgramingLanguagesAndTools } from "../scripts/constants";
</script>

<div class="about-flex">
	<div>
		<div style="padding-right: 20px;">
			<div class="pfp cursor-pointer"/>
		</div>
	</div>

	<div class="text">
		I am a 2nd Year Computer Science Engineering student from <strong>India</strong>. I initally started programming with <strong>C++</strong> in <strong>2015</strong> during my school days.
		Gradually I fell in love with Programming and was fascinated with what we can do with it. After my class 10th I took <strong>Computer Science</strong>.<br>
		<br>
		<strong>
			<h2>Programming Languages and Tools:</h2>
		</strong>

		<div class="flex flex-wrap" style="margin-top: 8px;">
			{#each ProgramingLanguagesAndTools as thing}
				<img 
					src="https://cdn.statically.io/gh/devicons/devicon/master/icons/{thing[0]}/{thing[0]}-{thing[1]}.svg"
					draggable="false" 
					alt={thing[0]} 
					width=70 
					height=70
					class="cursor-pointer"
				/>
			{/each}
		</div>
		<div style="height: 80px;"></div>
	</div>
</div>

<style>
	.pfp {
		width: 300px;
		height: 300px;
		border-radius: 6px;
		background: url('https://cdn.jsdelivr.net/gh/Anish-Shobith/website/assets/images/anish.webp') no-repeat;
		background-size: cover;
	}

	.text {
		opacity: .85;
		font-size: 18px;
		line-height: 1.3;
		margin-top: 30px;
	}

	strong {
		font-weight: lighter;
		color: var(--lighter-green);
		opacity: 1!important;
	}

	@media (max-width: 600px) {
		.text {
			margin-top: 50px;
		}

		.pfp, .pfp::after {
			width: calc(86vw - 20px);
			height: calc(86vw - 20px);
		}

		.pfp:hover, .pfp:focus,
		.pfp:hover::after,
		.pfp:focus::after {
			width: calc(86vw - 10px);
			height: 86vw;
		}
	}

	@media (min-width: 600px) {
		.about-flex {
			display: flex;
			flex-wrap: nowrap;
		}

		.text {
			margin-left: 20px;
		}
	}
</style>
