<script lang="ts">
  import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';

  import { getZNS } from 'popup/backend/zns';
  import { exportSecrePhrase } from 'popup/backend/wallet';

  let passwordElement = null;
  let loading = false;
  let password = '';
  let error = '';
  let words = '';

  $: buttonDisabled = loading || error || !password;

  onMount(() => {
    if (passwordElement && passwordElement.focus) {
      passwordElement.focus();
    }
  });

  const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			loading = true;
      words = await exportSecrePhrase(password);
		} catch (err) {
      error = err.message;
		}
		loading = false;
	}
</script>

<form on:submit={handleSubmit}>
  <div class="warn-message">
    <strong>
      {$_('security.p_modal.warn')}
    </strong>
  </div>
  {#if words}
    <textarea
      bind:value={words}
      readonly
    />
  {:else}
    <label>
      <input
        bind:this={passwordElement}
        bind:value={password}
        title={error}
        class:error={Boolean(error)}
        type="password"
        autocomplete="off"
        placeholder={$_('lock.placeholder')}
        required
        on:input={() => error = ''}
      >
    </label>
    <button
      class="warning"
      disabled={buttonDisabled}
    >
      {$_('send.send_btn')}
    </button>
  {/if}
</form>

<style lang="scss">
	@import "../styles/mixins";
  form {
    padding: 30px;
    height: 600px;
    @include flex-center-top-column;

    & > label,
    & > button {
      margin-block-end: 10px;
      width: 290px;
    }
  }
  input.error {
    outline-color: var(--danger-color);
    animation: shake .4s linear;
  }
  .warn-message {
    text-align: center;
    padding: 10px;
    border: solid 1px var(--danger-color);
    margin-block-end: 16px;

    @include border-radius(8px);

    & > strong {
      width: 280px;
      font-family: Demi;
      color: var(--text-color);
      text-shadow: 2px 1px 4px var(--danger-color);
      font-size: 16px;
    }
  }
  textarea {
    font-size: 16px;
    width: 100%;
    height: min-content;
    line-height: 1em;
  }
</style>
