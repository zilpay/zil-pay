<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import { closePopup } from 'popup/mixins/popup';

  import { uuidv4 } from 'lib/crypto/uuid';
  import { trim } from 'popup/filters/trim';
	import { jazziconCreate } from 'popup/mixins/jazzicon';

	import format from 'popup/store/format';
	import walletStore from 'popup/store/wallet';

  import SelectCard from '../components/SelectCard.svelte';
  import { AccountTypes } from 'config/account-type';


  const uuid = uuidv4();

  let loading = false;
  let error = '';
	let accountIndex = $walletStore.selectedAddress;

	$: account = $walletStore.identities[accountIndex];

  let message = {
    content: 'string;;',
    uuid: 'string;',
    title: 'title',
    icon: 'https://rollupjs.org/logo.svg',
    hash: ''
  };


	onMount(() => {
		jazziconCreate(uuid, account.base16);
  });

  const handleOnReject = async () => {
    await closePopup();
  };
  const handleOnSign = async () => {
    loading = true;

    try {
      await closePopup();
    } catch (err) {
      error = err.message;
    }
    loading = false;
  };
</script>


<main in:scale>
  <SelectCard
    header={account.name}
    text={trim(account[$format])}
  >
    <div id={uuid}/>
  </SelectCard>
  <hr/>
  <h1>
    {$_('decrypt.title')}
  </h1>
  <img
    src={message.icon}
    alt={message.title}
    width="55px"
    height="55px"
  />
  <h2>
    {message.title}
  </h2>
  <textarea readonly>
    {message.content}
  </textarea>
  <div class="btns">
    <button
      on:mouseup={handleOnReject}
      disabled={loading}
    >
      {$_('decrypt.btns.reject')}
    </button>
    <button
      class="primary"
      class:loading={loading}
      disabled={loading || account.type === AccountTypes.Track}
      on:mouseup={handleOnSign}
    >
      {$_('decrypt.btns.confirm')}
    </button>
  </div>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;
		@include flex-center-column;
	}
  h1 {
    @include fluid-font(320px, 1024px, 22px, 55px);
  }
  img {
    margin: 16px;
  }
  textarea {
    line-height: 1em;
    margin: 0;
    padding: 5px;
    min-height: 100px;
    font-weight: normal;
    overflow-y: scroll;
  }
  .btns {
    width: 290px;
    @include flex-between-row;

    & > button {
      min-height: 50px;
      margin: 10px;
    }
  }
</style>
