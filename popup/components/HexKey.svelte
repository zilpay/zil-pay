<script lang="ts">
  let {
    hexKey = '',
    title = ''
  }: {
    hexKey: string;
    title: string;
  } = $props();

  let currentPairs = $state<string[]>([]);
  let targetPairs = $state<string[]>([]);
  let animationStates = $state<boolean[]>([]);

  function getPairs(key: string): string[] {
    if (!key) return [];
    
    const cleanKey = key.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    const pairs: string[] = [];
    
    for (let i = 0; i < cleanKey.length; i += 2) {
      if (i + 2 <= cleanKey.length) {
        pairs.push(cleanKey.substring(i, i + 2));
      }
    }
    
    return pairs;
  }

  function getChunkSize(): number {
    if (typeof window === 'undefined') return 12;
    
    const width = window.innerWidth;
    
    if (width < 600) return 6;
    if (width < 905) return 8;
    if (width < 1240) return 10;
    
    return 12;
  }

  const chunks = $derived(() => {
    if (currentPairs.length === 0) return [];
    
    const chunkSize = getChunkSize();
    const result: string[][] = [];
    
    for (let i = 0; i < currentPairs.length; i += chunkSize) {
      result.push(currentPairs.slice(i, i + chunkSize));
    }
    
    return result;
  });

  function initializePairs() {
    currentPairs = getPairs(hexKey);
    targetPairs = [...currentPairs];
    animationStates = new Array(currentPairs.length).fill(false);
  }

  function startAnimation() {
    if (currentPairs.length === 0) return;

    const delayMs = 30;
    const acceleration = 1.0;

    for (let i = 0; i < currentPairs.length; i++) {
      let totalDelay = 0;
      for (let j = 0; j <= i; j++) {
        totalDelay += delayMs * Math.pow(acceleration, j);
      }

      setTimeout(() => {
        animationStates[i] = true;
        currentPairs[i] = targetPairs[i];

        setTimeout(() => {
          animationStates[i] = false;
        }, 80);
      }, totalDelay);
    }
  }

  $effect(() => {
    if (!hexKey) {
      currentPairs = [];
      targetPairs = [];
      animationStates = [];
      return;
    }

    const newTargetPairs = getPairs(hexKey);
    
    if (currentPairs.length === 0) {
      initializePairs();
      return;
    }

    if (newTargetPairs.length !== currentPairs.length) {
      currentPairs = [...newTargetPairs];
      targetPairs = [...newTargetPairs];
      animationStates = new Array(newTargetPairs.length).fill(false);
      return;
    }

    targetPairs = newTargetPairs;
    startAnimation();
  });
</script>

<div class="hex-key-display">
  {#if title}
    <h3 class="title">{title}</h3>
  {/if}
  
  <div class="hex-container">
    {#each chunks as chunk, chunkIndex}
      <div class="hex-row">
        {#each chunk as pair, pairIndex}
          {@const globalIndex = chunkIndex * getChunkSize() + pairIndex}
          {@const isAnimating = globalIndex < animationStates.length ? animationStates[globalIndex] : false}
          
          <div 
            class="hex-pair"
            class:animating={isAnimating}
          >
            {pair}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .hex-key-display {
    width: 100%;
    padding: var(--padding-side);
    box-sizing: border-box;
  }

  .title {
    font-size: calc(var(--font-size-xl) * 1.05);
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 var(--padding-side) 0;
    line-height: 1.3;
  }

  .hex-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 100%;
  }

  .hex-row {
    display: flex;
    gap: 0;
    min-height: 32px;
    align-items: center;
    flex-wrap: nowrap;
  }

  .hex-pair {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    min-height: 32px;
    font-family: 'Courier New', 'Courier', monospace;
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--text-primary);
    border-radius: 4px;
    transition: color 100ms ease;
    white-space: nowrap;
    flex-shrink: 0;

    &.animating {
      color: var(--secondary-purple);
    }
  }

  @media (max-width: 600px) {
    .hex-pair {
      width: calc(100% / 6);
      min-width: 40px;
    }
  }

  @media (min-width: 600px) and (max-width: 905px) {
    .hex-pair {
      width: calc(100% / 8);
      min-width: 42px;
    }
  }

  @media (min-width: 905px) and (max-width: 1240px) {
    .hex-pair {
      width: calc(100% / 10);
      min-width: 44px;
    }
  }

  @media (min-width: 1240px) {
    .hex-pair {
      width: calc(100% / 12);
      min-width: 45px;
    }
  }
</style>
