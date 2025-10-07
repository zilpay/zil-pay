<script lang="ts">
  type ShapeConfig = {
    color: string;
    transform: string;
  };

  let {
    diameter,
    seed,
    shapeCount = 4,
    onclick = () => {}
  }: {
    diameter: number;
    seed: string;
    shapeCount?: number;
    onclick?: (event: MouseEvent) => void;
  } = $props();

  const THEME_COLORS = [
    'var(--color-content-text-purple)',
    'var(--color-content-text-pink)',
    'var(--color-content-icon-accent-secondary)',
    'var(--color-content-icon-accent-primary)',
    'var(--color-neutral-tag-purple-fg)',
    'var(--color-neutral-tag-pink-fg)',
    'var(--color-button-regular-primary-default)',
    'var(--color-button-regular-secondary-default)',
    'var(--color-positive-border-primary)',
    'var(--color-notification-positive-content)'
  ];

  function generateSeedFromString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function mulberry32(a: number): () => number {
    return function() {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  const shapes = $derived(() => {
    if (!seed) return [];
    
    const random = mulberry32(generateSeedFromString(seed));

    function genColor(remainingColors: string[]): string {
      if (remainingColors.length === 0) return THEME_COLORS[0];
      const idx = Math.floor(random() * remainingColors.length);
      return remainingColors.splice(idx, 1)[0];
    }
    
    const shapeConfigs: ShapeConfig[] = [];
    const remainingColors = [...THEME_COLORS];
    
    const backgroundColor = genColor(remainingColors);
    shapeConfigs.push({
      color: backgroundColor,
      transform: ''
    });

    function genShape(i: number, total: number) {
      const center = diameter / 2;
      const firstRot = random();
      const angle = 2 * Math.PI * firstRot;
      const velocity = (diameter / total * random()) + (i * diameter / total);

      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      const secondRot = random();
      const rot = (firstRot * 360) + secondRot * 180;
      const transform = `
        translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px) 
        translate(${center}px, ${center}px) 
        rotate(${rot.toFixed(3)}deg) 
        translate(${-center}px, ${-center}px)
      `;

      return {
          color: genColor(remainingColors),
          transform
      };
    }

    for (let i = 0; i < shapeCount - 1; i++) {
      shapeConfigs.push(genShape(i, shapeCount - 1));
    }

    return shapeConfigs;
  });
</script>

<button 
  class="jazzicon-button"
  {onclick}
  style:width="{diameter}px" 
  style:height="{diameter}px"
  aria-label="Jazzicon"
  type="button"
>
  <div 
    class="jazzicon-container" 
    style:width="{diameter}px" 
    style:height="{diameter}px"
  >
    {#each shapes() as shape, i}
      <div 
        class="shape"
        style:background-color={shape.color}
        style:transform={shape.transform}
        style:border-radius={i === 0 ? '50%' : '0'}
        style:width="{diameter}px"
        style:height="{diameter}px"
      ></div>
    {/each}
  </div>
</button>

<style lang="scss">
  .jazzicon-button {
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    border-radius: 50%;
    position: relative;
    transition: all 0.2s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: content-box;
    flex-shrink: 0;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      border: 2px solid transparent;
      transition: border-color 0.2s ease-in-out;
    }

    &:hover::before {
      border-color: var(--color-neutral-border-hover);
    }
    
    &:focus {
      outline: none;
    }

    &:focus-visible::before {
      border-color: var(--color-inputs-border-focus);
      box-shadow: 0 0 0 2px var(--color-neutral-background-base), 0 0 0 4px var(--color-inputs-border-focus);
    }

    &:active {
      transform: scale(0.96);
    }
  }

  .jazzicon-container {
    display: block;
    position: relative;
    overflow: hidden;
    border-radius: 50%;
  }

  .shape {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
