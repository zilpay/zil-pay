<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { getState } from "popup/backend";
	import { _ } from 'popup/i18n';
	import {
		changeGasMultiplier,
		resetGas
	} from 'popup/backend/gas';
	import { changeLockTimer } from 'popup/backend/settings';

	import gasStore from 'popup/store/gas';
	import timeLock from 'popup/store/lock-time';

	import NavClose from '../../components/NavClose.svelte';
	import GasControl from '../../components/GasControl.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';
	import Toggle from '../../components/Toggle.svelte';

	let base16 = false;
	let popup = true;
	let time = $timeLock;

	const handleOnChangeGasMultiplier = async ({ detail }) => {
		await changeGasMultiplier(detail);
	};
	const handleBlurLockTimer = async (_) => {
		if (time !== $timeLock) {
			await tick();
			const t = Math.round(time)
			await changeLockTimer(Math.abs(t));
		}
  };
	const hanldeOnReset = async () => {
		await resetGas();
	};
</script>

<main>
	<NavClose title={'Advanced'}/>
	<div>
		<Jumbotron
			title={$_('advanced.gas.title')}
			description={$_('advanced.gas.description')}
		>
			<GasControl
				multiplier={$gasStore.multiplier}
				gasLimit={$gasStore.gasLimit}
				on:select={handleOnChangeGasMultiplier}
			/>
		</Jumbotron>
		<Jumbotron
			title={$_('advanced.time.title')}
		>
			<div>
				<input
					bind:value={time}
					type="number"
					step="1"
					min="1"
					max="24"
					on:blur={handleBlurLockTimer}
				/>
			</div>
		</Jumbotron>
		<Jumbotron
			title={$_('advanced.base16.title')}
			description={$_('advanced.base16.description')}
		>
			<Toggle
				checked={base16}
				on:toggle={() => base16 = !base16}
			/>
		</Jumbotron>
		<Jumbotron
			title={$_('advanced.popup.title')}
			description={$_('advanced.popup.description')}
		>
			<Toggle
				checked={popup}
				on:toggle={() => popup = !popup}
			/>
		</Jumbotron>
	</div>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
		background-color: var(--background-color);
    overflow-y: scroll;
		@include flex-center-top-column;
	}
	input {
		width: 100%;
		border-color: var(--muted-color);

		&:focus {
			border-color: var(--text-color);
		}
	}
</style>
