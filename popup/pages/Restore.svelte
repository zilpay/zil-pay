<script lang="ts">
	import { pop } from 'svelte-spa-router';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';

	import NavClose from '../components/NavClose.svelte';
	import Loader from '../components/Loader.svelte';

  let words: string;
  let password: string;
  let confirmPassword: string;
	let loading = false;

	$: disabled = loading || !password || confirmPassword !== password;

  const handleSubmit = async (e) => {
		e.preventDefault();

    console.log(e);

		try {
			loading = true;
		} catch (err) {
			// error = `${$_('lock.error')}-(${err.message})`;
		}
		loading = false;
	}
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <NavClose title={$_('restore.title')}/>
  <form on:submit={handleSubmit}>
    <textarea
      bind:value={words}
      placeholder={$_('restore.placeholder')}
      required
    />
    <input
      bind:value={password}
      type="password"
      placeholder={$_('restore.pass_placeholder')}
      required
    >
    <input
      bind:value={confirmPassword}
      type="password"
      placeholder={$_('restore.conf_placeholder')}
      required
    >
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
				{$_('restore.title')}
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

    & > input, button {
      max-width: 290px;
      margin: 10px;
    }
  }
  textarea {
    outline: none;
    resize: none;
    overflow: hidden;

    border-radius: 8px;
    padding: 14px;
    margin-bottom: 30px;
    box-sizing: border-box;

    height: calc(100vh - 600px);
    min-height: 200px;
    width: calc(100vw - 30px);
    max-width: 600px;

    background: var(--background-color);
    border-color: var(--text-color);
    color: var(--text-color);

		@include fluid-font(320px, 600px, 16px, 33px);
  }
</style>
