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
  import Modal from '../components/Modal.svelte';
	import AccountsModal from '../modals/Accounts.svelte';
  import { AccountTypes } from 'config/account-type';
  import cipherStore from 'app/store/cipher';
  import { responseEncryption } from 'app/backend/cipher';


  const uuid = uuidv4();

  let loading = false;
  let error = '';
	let accountsModal = false;
	let accountIndex = $walletStore.selectedAddress;

	$: account = $walletStore.identities[accountIndex];
  $: message = $cipherStore.encryptParams;


	onMount(() => {
		jazziconCreate(uuid, account.base16);
  });

	const onSelectAccount = async ({ detail }) => {
    accountIndex = detail;
    accountsModal = false;
	};
  const handleOnReject = async () => {
    await responseEncryption(false);
    await closePopup();
  };
  const handleOnEncrypt = async () => {
    loading = true;

    try {
      await responseEncryption(true);
      await closePopup();
    } catch (err) {
      error = err.message;
    }
    loading = false;
  };
</script>

<Modal
  show={accountsModal}
  title={$_('send.cards.token')}
  on:close={() => accountsModal = !accountsModal}
>
  <div class="m-warp">
    <AccountsModal
      list={$walletStore.identities}
      index={accountIndex}
      on:selected={onSelectAccount}
    />
  </div>
</Modal>
<main in:scale>
  <SelectCard
    header={account.name}
    text={trim(account[$format])}
    on:click={() => accountsModal = !accountsModal}
  >
    <div id={uuid}/>
  </SelectCard>
  <hr />
  <h1>
    {$_('encrypt.title')}
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
      {$_('encrypt.btns.reject')}
    </button>
    <button
      class="primary"
      class:loading={loading}
      disabled={loading || account.type === AccountTypes.Track}
      on:mouseup={handleOnEncrypt}
    >
      {$_('encrypt.btns.confirm')}
    </button>
  </div>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;
		@include flex-center-top-column;
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
    min-height: 200px;
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
