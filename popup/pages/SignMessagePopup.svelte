<script lang="ts">
  import AccountCard from '../components/AccountCard.svelte';
  import Button from '../components/Button.svelte';
  import InfoIcon from '../components/icons/Info.svelte';
  import CopyIcon from '../components/icons/Copy.svelte';
  import FullScreenIcon from '../components/icons/FullScreen.svelte';

  let requestFrom = $state('app.uniswap.org');
  let interactingWith = $state('0x00000...00000');
  let primaryType = $state('Message');
  let content = $state('Message');
  let walletName = $state('This Is my Wallet 1');
  let walletAddress = $state('0x03x6...2aEBC5');

  const handleCancel = () => {
  };

  const handleConfirm = () => {
    console.log('Signature confirmed');
  };

  const handleCopy = () => {
    console.log('Copy message');
  };

  const handleExpand = () => {
    console.log('Expand message');
  };
</script>

<main>
  <div class="wallet-section">
    <AccountCard
      name={walletName}
      address={walletAddress}
      selected={false}
      onclick={() => {}}
    />
  </div>

  <div class="content">
    <div class="header">
      <h1 class="title">Signature request</h1>
      <p class="subtitle">Review request details before confirm</p>
    </div>

    <div class="info-section">
      <div class="info-card">
        <div class="info-row">
          <div class="info-label">
            <span>Request from</span>
            <InfoIcon width={16} height={16} />
          </div>
          <div class="info-value">{requestFrom}</div>
        </div>
        <div class="info-row">
          <div class="info-label">
            <span>Interacting with</span>
            <InfoIcon width={16} height={16} />
          </div>
          <div class="info-value">{interactingWith}</div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-header">
          <div class="info-title">Message</div>
          <div class="info-actions">
            <button class="icon-button" onclick={handleCopy} type="button">
              <CopyIcon width={20} height={20} />
            </button>
            <button class="icon-button" onclick={handleExpand} type="button">
              <FullScreenIcon width={20} height={20} />
            </button>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">Primary type:</div>
          <div class="info-value">{primaryType}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Content:</div>
          <div class="info-value">{content}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="actions">
    <Button variant="outline" width="150px" onclick={handleCancel}>
      Cancel
    </Button>
    <Button variant="primary" width="150px" onclick={handleConfirm}>
      Confirm
    </Button>
  </div>
</main>

<style lang="scss">
  main {
    width: 340px;
    height: 600px;
    background: var(--color-cards-navigation-base-default);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .wallet-section {
    margin: 16px 16px 0;
  }

  .content {
    margin: 20px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title {
    color: var(--color-content-text-inverted);
    font-size: 20px;
    font-weight: 700;
    line-height: 30px;
    margin: 0;
  }

  .subtitle {
    color: var(--color-content-text-secondary);
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    margin: 0;
  }

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .info-card {
    padding: 12px;
    background: var(--color-cards-regular-base-default);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--color-content-text-inverted);
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  }

  .info-value {
    color: var(--color-content-text-inverted);
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    text-align: right;
  }

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-title {
    color: var(--color-content-text-inverted);
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
  }

  .info-actions {
    display: flex;
    gap: 8px;
  }

  .icon-button {
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.7;
    }
  }

  .actions {
    margin: 0 16px 16px;
    display: flex;
    gap: 8px;
  }
</style>
