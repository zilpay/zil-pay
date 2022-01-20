<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { _ } from 'popup/i18n';
	import { w3cwebsocket } from "websocket";

  import { ZilPayConnect } from "config/connect";

  import { getZNS } from 'popup/backend/zns';
  import { exportWalletQrcode } from 'popup/backend/wallet';

  const dispatch = createEventDispatcher();

  let client;

  let passwordElement = null;
  let loading = false;
  let password = '';
  let error = '';
  let data = null;

  $: buttonDisabled = loading || error || !password;

  onMount(() => {
    if (passwordElement && passwordElement.focus) {
      passwordElement.focus();
    }
  });

  onDestroy(() => {
    if (client && client.close) {
      client.close();
    }
  });

  const handleSubmit = async (e) => {
		e.preventDefault();

    loading = true;
		try {
      data = await exportWalletQrcode(password);
      client = new w3cwebsocket(ZilPayConnect.Host, ZilPayConnect.Protocol);
      client.onerror = function(err) {
        client.close();
      };

      client.onopen = function() {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({
            data: data.data,
            uuid: data.uuid,
            type: 'Share'
          }));
        }
        client.onclose = function() {
          dispatch('close');
          console.log('echo-protocol Client Closed');
        };
      };
		} catch (err) {
      error = err.message;
		}
		loading = false;
	}
</script>

<form on:submit={handleSubmit}>
  <div class="warn-message">
    <strong>
      {$_('security.connect.warn_message')}
    </strong>
  </div>
  {#if data}
    <img
      src={data.base58}
      width="300"
      alt="qrcode"
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
      {$_('security.connect.btn')}
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
      color: var(--text-color);
      font-family: Demi;
      text-shadow: 2px 1px 4px var(--danger-color);
      font-size: 16px;
    }
  }
</style>
