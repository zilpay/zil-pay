<script lang="ts">
  import { createEventDispatcher } from 'svelte';
	import { _ } from 'popup/i18n';
  import { uuidv4 } from 'lib/crypto/uuid';
	import { jazziconCreate } from 'popup/mixins/jazzicon';

  import { getZNS } from 'popup/backend/zns';

  const dispatch = createEventDispatcher();
  const uuid = uuidv4();

  let loading = false;
  let address: string | null = null;
  let error = '';

  const handleOnInput = async (e) => {
    const content = e.target.value;
    const regExpDomain = /.*\w.zil/gm;

    if (regExpDomain.test(content)) {
      loading = true;
      console.log(content);

      try {
        const resolver = await getZNS(content);
        console.log(resolver);
      } catch (err) {
        error = err.message;
      }
      loading = false;
    }
  };

  // onMount(() => {
	// 	jazziconCreate(uuid, account.base16);
  // });
</script>

<form>
  <label>
    <input
      placeholder={$_('send.input_to.placeholder')}
      class:loading={loading}
      disabled={loading}
      on:input={handleOnInput}
    />
  </label>
  <label>
    <input
      placeholder={$_('contacts.form.name_placeholder')}
    />
  </label>
  <button class="primary">
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
  input.loading {
    cursor: progress;
    background: 
      linear-gradient(0.25turn, transparent, var(--card-color), transparent),
      linear-gradient(var(--background-color), var(--background-color)),
      radial-gradient(38px circle at 19px 19px, var(--background-color) 50%, transparent 51%),
      linear-gradient(var(--background-color), var(--background-color));  
    background-repeat: no-repeat;
    background-size: 315px 250px, 515px 580px, 500px 500px, 537px 24px;
    background-position: -315px 0, 0 0, 0px 190px, 50px 195px; 
    animation: loading 2.5s infinite;
  }
</style>
