<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { getState } from "popup/backend";
	import { _ } from 'popup/i18n';
	import {
		changeGasMultiplier,
		resetGas
	} from 'popup/backend/gas';

	import gasStore from 'popup/store/gas';

	import NavClose from '../../components/NavClose.svelte';
	import GasControl from '../../components/GasControl.svelte';

	const handleOnChangeGasMultiplier = async ({ detail }) => {
		await changeGasMultiplier(detail);
	};
	const hanldeOnReset = async () => {
		await resetGas();
	};
</script>

<main>
	<NavClose title={'Advanced'}/>

	<div>
    <GasControl
			multiplier={$gasStore.multiplier}
			gasLimit={$gasStore.gasLimit}
			on:select={handleOnChangeGasMultiplier}
		/>
	</div>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
