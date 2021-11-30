<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import { closePopup } from 'popup/mixins/popup';

  import { uuidv4 } from 'lib/crypto/uuid';
  import { trim } from 'popup/filters/trim';
	import { jazziconCreate } from 'popup/mixins/jazzicon';
  import { rejectSignMessage, signMessageApprove } from 'popup/backend/sign';

	import format from 'popup/store/format';
	import walletStore from 'popup/store/wallet';
  import transactionsStore from 'popup/store/transactions';

  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
	import AccountsModal from '../modals/Accounts.svelte';
	import Toggle from '../components/Toggle.svelte';

	let loading = false;
  let error = '';
	let accountsModal = false;
	let accountIndex = $walletStore.selectedAddress;
  let isHash = false;

	$: account = $walletStore.identities[accountIndex];
  $: message = $transactionsStore.message;

  const uuid = uuidv4();

	onMount(() => {
		jazziconCreate(uuid, account.base16);
  });

	const onSelectAccount = async ({ detail }) => {
    accountIndex = detail;
    accountsModal = false;
	};
  const handleOnReject = async () => {
    await rejectSignMessage();
    await closePopup();
  };
  const handleOnSign = async () => {
    loading = true;
    try {
      await signMessageApprove(accountIndex);
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
  <hr/>
  <h1>
    {$_('sig_message.title')}
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
    {isHash ? message.hash : message.content}
  </textarea>
  <div class="toggle">
    <h3>
      {$_('sig_message.hash')}
    </h3>
    <Toggle
      checked={isHash}
      on:toggle={() => isHash = !isHash}
    />
  </div>
  <hr />
  <div class="btns">
    <button
      class="primary"
      class:loading={loading}
      disabled={loading}
      on:click={handleOnSign}
    >
      {$_('sig_message.btns.confirm')}
    </button>
    <button
      on:click={handleOnReject}
      disabled={loading}
    >
      {$_('sig_message.btns.reject')}
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
  .toggle {
    width: 290px;
    @include flex-between-row;
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
