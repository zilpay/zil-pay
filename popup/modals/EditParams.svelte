<script lang="ts">
  import { createEventDispatcher } from 'svelte';
	import { _ } from 'popup/i18n';

  const dispatch = createEventDispatcher();

  export let tx = {
    gasLimit: 0,
    gasPrice: 0,
    nonce: 0
  };

  const handleSubmit = (e) => {
		e.preventDefault();

		try {
      dispatch('update', tx);
		} catch (err) {
      console.log(err);
		}
	}
</script>

<form on:submit={handleSubmit}>
  <label>
    <p>
      {$_('confirm.parmas_modal.price')}
    </p>
    <input
      bind:value={tx.gasPrice}
      type="number"
    />
  </label>
  <label>
    <p>
      {$_('confirm.parmas_modal.limit')}
    </p>
    <input
      bind:value={tx.gasLimit}
      type="number"
    />
  </label>
  <label>
    <p>
      {$_('confirm.params.nonce')}
    </p>
    <input
      bind:value={tx.nonce}
      min="0"
      type="number"
    />
  </label>
  <button class="primary">
    {$_('confirm.parmas_modal.btn')}
  </button>
</form>

<style lang="scss">
	@import "../styles/mixins";
  input,
  button {
    width: 290px;
  }
  form {
		height: 600px;
    width: 100%;

    @include flex-center-top-column;

    & > button {
      margin-block-start: 10px;
    }
  }
</style>
