<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
	import { _ } from 'popup/i18n';
  import { uuidv4 } from 'lib/crypto/uuid';
	import { jazziconCreate } from 'popup/mixins/jazzicon';

  import { getZNS } from 'popup/backend/zns';
  import { addContact } from 'popup/backend/contacts';

  const dispatch = createEventDispatcher();
  const uuid = uuidv4();

  let nameElement = null;
  let loading = false;
  let address = '';
  let name = '';
  let error = '';

  $: buttonDisabled = loading || error || !address || !name;

  onMount(() => {
    if (nameElement && nameElement.focus) {
      nameElement.focus();
    }
  });

  const handleOnInput = async (e) => {
    error = '';
    const content = e.target.value;
    const regExpDomain = /.*\w.zil/gm;

    if (regExpDomain.test(content)) {
      loading = true;
      try {
        const resolver = await getZNS(content);
        name = resolver.domain;
        if (resolver.address) {
          address = resolver.address.bech32;
          jazziconCreate(uuid, resolver.address.base16);
        } else {
          address = resolver.owner.bech32;
          jazziconCreate(uuid, resolver.owner.base16);
        }
      } catch (err) {        
        error = err.message;
      }
      loading = false;
    }
  };
  const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			loading = true;
			await addContact({
        name,
        address
      });
      dispatch('close');
		} catch (err) {
      console.log(err);
      error = err.message;
		}
		loading = false;
	}
</script>

<form on:submit={handleSubmit}>
  <div id={uuid}/>
  <label class:error={Boolean(error)}>
    {error}
    <input
      bind:this={nameElement}
      bind:value={address}
      class:error={Boolean(error)}
      placeholder={$_('send.input_to.placeholder')}
      class:loading={loading}
      disabled={loading}
      on:input={handleOnInput}
    />
  </label>
  <label>
    <input
      bind:value={name}
      class:loading={loading}
      disabled={loading}
      placeholder={$_('contacts.form.name_placeholder')}
    />
  </label>
  <button
    class="primary"
    disabled={buttonDisabled}
  >
    {$_('contacts.form.add')}
  </button>
</form>

<style lang="scss">
	@import "../styles/mixins";
  form {
    padding: 30px;
    height: 600px;
    @include flex-center-top-column;

    & > label,
    & > button {
      margin: 10px;
      min-width: 290px;
      max-width: 400px;
      width: 100%;
    }
  }
</style>
