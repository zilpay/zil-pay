<script lang="ts">
  let {
    title,
    description,
    icon,
    onclick = () => {}
  } = $props();
</script>

<button class="wallet-option" onclick={() => onclick}>
  <div class="option-icon">
    {#if typeof icon === 'string'}
      <span class="icon-symbol">{icon}</span>
    {:else}
      {@const Component = icon}
      <Component />
    {/if}
  </div>
  <div class="option-content">
    <h3 class="option-title">{title}</h3>
    <p class="option-description">{description}</p>
  </div>
  <div class="option-arrow">
    <span>›</span>
  </div>
</button>

<style lang="scss">
  .wallet-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 20px;
    background-color: var(--card-background);
    border: 2px solid transparent;
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    min-height: 80px;
    transition: all 0.2s ease;

    &:hover {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
      background-color: color-mix(in srgb, var(--card-background) 95%, var(--primary-purple));
    }

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-right: 16px;
    flex-shrink: 0;
    background: linear-gradient(135deg, var(--primary-purple), color-mix(in srgb, var(--primary-purple) 80%, #000));
    border-radius: 12px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-purple) 25%, transparent);
  }

  .icon-symbol {
    font-size: 24px;
    font-weight: bold;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .option-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-right: 12px;
  }

  .option-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;
  }

  .option-description {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    opacity: 0.8;
    line-height: 1.4;
  }

  .option-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;

    span {
      font-size: 20px;
      color: var(--text-secondary);
      opacity: 0.6;
    }
  }

  .wallet-option:hover .option-arrow span {
    color: var(--primary-purple);
    opacity: 1;
  }
</style>
