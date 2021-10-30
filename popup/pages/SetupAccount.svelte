<script lang="ts">
	import { pop, push } from 'svelte-spa-router';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
	import { createNextSeedAccount } from "popup/backend";

	import NavClose from '../components/NavClose.svelte';
	import Loader from '../components/Loader.svelte';

  const MAX_LEN = 25;
  const MIN_LEN = 3;

	let loading = false;
  let name = 'Account 0';

	$: disabled = loading || !name;

  const handleSubmit = async (e) => {
		e.preventDefault();
    loading = true;

		try {
      await createNextSeedAccount(name);
      push('/home');
			loading = false;
		} catch (err) {
      loading = false;
		}
	}
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <NavClose title={$_('setup_acc.title')}/>
  <form on:submit={handleSubmit}>
    <label>
			<input
				bind:value={name}
        maxlength={MAX_LEN}
        minlength={MIN_LEN}
				placeholder={$_('setup_acc.name_placeholder')}
        required
			>
			<p>
				{$_('setup_acc.name_description')}
      </p>
		</label>
    <button
			class="primary"
			disabled={disabled}
		>
			{#if loading}
				<span>
					<Loader
						width="25px"
						height="25px"
					/>
				</span>
			{:else}
				{$_('restore.btn')}
			{/if}
		</button>
  </form>
</main>

<style type="text/scss">
  @import "../styles/mixins";
  main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
  }
  form {
    width: 100%;
    @include flex-center-column;

    & > label, button {
      width: 100%;
      max-width: 290px;
      margin: 10px;
    }
  }
</style>
