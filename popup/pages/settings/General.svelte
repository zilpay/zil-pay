<script lang="ts">
	import { _ } from 'popup/i18n';

	import { DEFAULT_CURRENCIES } from 'config/currencies';
	import { Themes } from 'config/theme';
	import { Locales } from 'config/locale';
	import {
		changeCurrency,
		resetCurrency,
		changeTheme,
		resetTheme,
		changeLocale,
		resetLocale
	} from 'popup/backend/settings';

	import currencyStore from 'popup/store/currency';
	import themeStore from 'popup/store/theme';
	import localeStore from 'popup/store/locale';

	import NavClose from '../../components/NavClose.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';

	const themesList = Object.values(Themes);
	const locales = Object.values(Locales);

	const hanldeChangeCurrency = async (e) => {
		const currency = e.target.value;
		await changeCurrency(currency);
	};
	const hanldeChangeTheme = async (e) => {
		const theme = e.target.value;
		await changeTheme(theme);
	};
	const hanldeChangeLocale = async (e) => {
		const locale = e.target.value;
		await changeLocale(locale);
	};
	const hanldeOnReset = async () => {
		await resetCurrency();
		await resetTheme();
		await resetLocale();
	};
</script>

<main>
	<NavClose title={$_('general.title')}/>
	<div>
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
			<select on:input={hanldeChangeTheme}>
				{#each themesList as theme}
					<option
						value={theme}
						selected={theme === $themeStore}
					>
						{theme}
					</option>
				{/each}
			</select>
		</Jumbotron>
		<Jumbotron
			title={$_('general.lang.title')}
			description={$_('general.lang.description')}
		>
			<select on:input={hanldeChangeLocale}>
				{#each locales as locale}
					<option
						value={locale}
						selected={locale === $localeStore}
					>
						{locale}
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
