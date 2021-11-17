<script lang="ts">
	import { _ } from 'popup/i18n';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { DEFAULT_CURRENCIES } from 'config/currencies';
	import { changeCurrency, resetCurrency } from 'popup/backend/settings';

	import currencyStore from 'popup/store/currency';

	import NavClose from '../../components/NavClose.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';

	const hanldeChangeCurrency = async (e) => {
		const currency = e.target.value;
		await changeCurrency(currency);
	};
	const hanldeOnReset = async () => {
		await resetCurrency();
	};
</script>

<main>
	<NavClose title={$_('general.title')}/>
	<div in:fly={flyTransition.in}>
		<Jumbotron
			title={$_('general.currency.title')}
			description={$_('general.currency.description')}
		>
			<select on:input={hanldeChangeCurrency}>
				{#each DEFAULT_CURRENCIES as currency}
					<option
						value={currency}
						selected={currency === $currencyStore}
					>
						{currency}
					</option>
				{/each}
			</select>
		</Jumbotron>
		<Jumbotron
			title={$_('general.theme.title')}
			description={$_('general.theme.description')}
		>
			<select on:input={hanldeChangeCurrency}>
				{#each DEFAULT_CURRENCIES as currency}
					<option
						value={currency}
						selected={currency === $currencyStore}
					>
						{currency}
					</option>
				{/each}
			</select>
		</Jumbotron>
	</div>
	<button
		class="warning"
		on:click={hanldeOnReset}
	>
		{$_('general.reset')}
	</button>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	select {
		text-transform: uppercase;
	}
	button {
		width: 290px;
	}
</style>
