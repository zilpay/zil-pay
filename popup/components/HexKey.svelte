<script lang="ts">
  import { onMount } from 'svelte';

  let { hexKey = '', title = '' }: { hexKey: string; title: string } = $props();

  let currentPairs = $state<string[]>([]);
  let animationStates = $state<boolean[]>([]);
  let chunkSize = $state(12);
  let isMounted = false;

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

  function updateChunkSize() {
    if (typeof window === 'undefined') return;
    const width = window.innerWidth;
    if (width < 600) chunkSize = 6;
    else if (width < 905) chunkSize = 8;
    else if (width < 1240) chunkSize = 10;
    else chunkSize = 12;
  }

  const chunks = $derived(() => {
    const result: string[][] = [];
    if (currentPairs.length === 0) return [];
    for (let i = 0; i < currentPairs.length; i += chunkSize) {
      result.push(currentPairs.slice(i, i + chunkSize));
    }
    return result;
  });

  function startAnimation(target: string[]) {
    const delayMs = 30;
    const acceleration = 1.0;

    for (let i = 0; i < target.length; i++) {
      let totalDelay = 0;
      for (let j = 0; j <= i; j++) {
        totalDelay += delayMs * Math.pow(acceleration, j);
      }

      setTimeout(() => {
        if (!animationStates) return;
        animationStates[i] = true;
        currentPairs[i] = target[i];

        setTimeout(() => {
          if (!animationStates) return;
          animationStates[i] = false;
        }, 80);
      }, totalDelay);
    }
  }

  onMount(() => {
    isMounted = true;
    updateChunkSize();
    window.addEventListener('resize', updateChunkSize);
    return () => {
      window.removeEventListener('resize', updateChunkSize);
    };
  });

  $effect(() => {
    if (!isMounted || !hexKey) {
      return;
    }
    
    const newTargetPairs = getPairs(hexKey);
    
    currentPairs = new Array(newTargetPairs.length).fill('  ');
    animationStates = new Array(newTargetPairs.length).fill(false);

    setTimeout(() => {
      startAnimation(newTargetPairs);
    });
  });

</script>

<div class="hex-key-display">
  {#if title}
    <h3 class="title">{title}</h3>
  {/if}
  
  <div class="hex-container">
    {#each chunks() as chunk, chunkIndex}
      <div class="hex-row">
        {#each chunk as pair, pairIndex}
          {@const globalIndex = chunkIndex * chunkSize + pairIndex}
          {@const isAnimating = animationStates[globalIndex] ?? false}
          
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
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0 0 var(--padding-side) 0;
    line-height: 1.3;
  }

  .hex-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .hex-row {
    display: flex;
    gap: 0;
    min-height: 32px;
    align-items: center;
  }

  .hex-pair {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: 32px;
    font-family: 'Courier New', Courier, monospace;
    font-size: var(--font-size-medium);
    font-weight: 500;
    color: var(--text-primary);
    border-radius: 4px;
    transition: color 100ms ease-in-out;
    
    &.animating {
      color: var(--secondary-purple);
    }
  }
</style>
