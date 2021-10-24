<main>
	<h1>Welcome back</h1>
</main>

<style type="text/scss">
	$primary: blue;
	main {
		text-align: center;
		padding: 1em;
		max-width: 340px;
		
		margin: 0 auto;
	}

	h1 {
		color: $primary;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
