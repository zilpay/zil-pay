<script lang="ts">
</script>

<main>
	<img src="/imgs/logo.webp" >
	<h1>Welcome back</h1>
</main>

<style type="text/scss">
	@import "../styles/mixins";

	h1 {
		color: var(--text-color);
		@include fluid-font(320px, 1024px, 22px, 55px);
	}

	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-column;
	}
</style>
