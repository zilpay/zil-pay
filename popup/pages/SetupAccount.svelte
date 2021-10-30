<script lang="ts">
	import { pop, push } from 'svelte-spa-router';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
	import { restorePhrase } from "popup/backend";

	import NavClose from '../components/NavClose.svelte';

  const MAX_LEN = 25;
  const MIN_LEN = 3;

  let name: string;
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <NavClose title={$_('setup_acc.title')}/>
  <form>
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
