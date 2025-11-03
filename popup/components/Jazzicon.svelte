<script lang="ts">
  type ShapeType = 'circle' | 'star' | 'star6' | 'star8' | 'triangle' | 'triangleDown' | 
                   'square' | 'diamond' | 'pentagon' | 'hexagon' | 'octagon' | 
                   'heart' | 'crescent' | 'cross' | 'plus';
  
  type ShapeConfig = {
    color: string;
    transform: string;
    type: ShapeType;
    scale: number;
    rotation: number;
  };

  let {
    diameter,
    seed,
    shapeCount = 15,
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

  const SHAPE_TYPES: ShapeType[] = [
    'circle', 'star', 'star6', 'star8', 'triangle', 'triangleDown',
    'square', 'diamond', 'pentagon', 'hexagon', 'octagon',
    'heart', 'crescent', 'cross', 'plus'
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

  function getStarPath(points: number = 5): string {
    const angle = (Math.PI * 2) / points;
    const outerRadius = 50;
    const innerRadius = 20;
    
    let path = '';
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const currentAngle = angle * i / 2 - Math.PI / 2;
      const x = 50 + Math.cos(currentAngle) * radius;
      const y = 50 + Math.sin(currentAngle) * radius;
      path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }
    return path + 'Z';
  }

  function getTrianglePath(): string {
    return 'M 50 15 L 85 85 L 15 85 Z';
  }

  function getTriangleDownPath(): string {
    return 'M 50 85 L 15 15 L 85 15 Z';
  }

  function getDiamondPath(): string {
    return 'M 50 10 L 90 50 L 50 90 L 10 50 Z';
  }

  function getPentagonPath(): string {
    const points = 5;
    const angle = (Math.PI * 2) / points;
    const radius = 45;
    
    let path = '';
    for (let i = 0; i < points; i++) {
      const currentAngle = angle * i - Math.PI / 2;
      const x = 50 + Math.cos(currentAngle) * radius;
      const y = 50 + Math.sin(currentAngle) * radius;
      path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }
    return path + 'Z';
  }

  function getHexagonPath(): string {
    const points = 6;
    const angle = (Math.PI * 2) / points;
    const radius = 45;
    
    let path = '';
    for (let i = 0; i < points; i++) {
      const currentAngle = angle * i - Math.PI / 2;
      const x = 50 + Math.cos(currentAngle) * radius;
      const y = 50 + Math.sin(currentAngle) * radius;
      path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }
    return path + 'Z';
  }

  function getOctagonPath(): string {
    const points = 8;
    const angle = (Math.PI * 2) / points;
    const radius = 45;
    
    let path = '';
    for (let i = 0; i < points; i++) {
      const currentAngle = angle * i - Math.PI / 2;
      const x = 50 + Math.cos(currentAngle) * radius;
      const y = 50 + Math.sin(currentAngle) * radius;
      path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }
    return path + 'Z';
  }

  function getHeartPath(): string {
    return 'M 50 85 C 50 85 20 60 20 40 C 20 25 30 15 40 15 C 45 15 50 20 50 20 C 50 20 55 15 60 15 C 70 15 80 25 80 40 C 80 60 50 85 50 85 Z';
  }

  function getCrescentPath(): string {
    return 'M 50 10 A 40 40 0 1 1 50 90 A 35 35 0 1 0 50 10 Z';
  }

  function getCrossPath(): string {
    return 'M 35 15 L 65 15 L 65 35 L 85 35 L 85 65 L 65 65 L 65 85 L 35 85 L 35 65 L 15 65 L 15 35 L 35 35 Z';
  }

  function getPlusPath(): string {
    return 'M 40 10 L 60 10 L 60 40 L 90 40 L 90 60 L 60 60 L 60 90 L 40 90 L 40 60 L 10 60 L 10 40 L 40 40 Z';
  }

  const shapes = $derived(() => {
    if (!seed) return [];
    
    const random = mulberry32(generateSeedFromString(seed));

    function genColor(remainingColors: string[]): string {
      if (remainingColors.length === 0) {
        return THEME_COLORS[Math.floor(random() * THEME_COLORS.length)];
      }
      const idx = Math.floor(random() * remainingColors.length);
      return remainingColors.splice(idx, 1)[0];
    }

    function genShapeType(): ShapeType {
      const idx = Math.floor(random() * SHAPE_TYPES.length);
      return SHAPE_TYPES[idx];
    }
    
    const shapeConfigs: ShapeConfig[] = [];
    const remainingColors = [...THEME_COLORS];
    
    const backgroundColor = genColor(remainingColors);
    shapeConfigs.push({
      color: backgroundColor,
      transform: '',
      type: 'circle',
      scale: 1,
      rotation: 0
    });

    function genShape(i: number, total: number): ShapeConfig {
      const center = diameter / 2;
      const maxRadius = diameter / 2.2;
      
      const firstRot = random();
      const angle = 2 * Math.PI * firstRot;
      
      const radiusRandom = random();
      const distanceFromCenter = Math.pow(radiusRandom, 0.7) * maxRadius;

      const tx = Math.cos(angle) * distanceFromCenter;
      const ty = Math.sin(angle) * distanceFromCenter;

      const secondRot = random();
      const rot = (firstRot * 360) + secondRot * 180;
      
      const scaleRandom = random();
      const scaleBase = 0.25 + scaleRandom * 0.7;
      const centerBoost = distanceFromCenter < maxRadius * 0.3 ? 1.2 : 1.0;
      const scale = scaleBase * centerBoost;
      
      const transform = `
        translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px) 
        translate(${center}px, ${center}px) 
        rotate(${rot.toFixed(3)}deg) 
        scale(${scale.toFixed(3)})
        translate(${-center}px, ${-center}px)
      `;

      return {
        color: genColor(remainingColors),
        transform,
        type: genShapeType(),
        scale,
        rotation: rot
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
      {#if i === 0}
        <div 
          class="shape shape-background"
          style:background-color={shape.color}
        ></div>
      {:else if shape.type === 'circle' || shape.type === 'square' || shape.type === 'diamond'}
        <div 
          class="shape shape-{shape.type}"
          style:background-color={shape.color}
          style:transform={shape.transform}
        ></div>
      {:else}
        <svg 
          class="shape shape-svg"
          style:transform={shape.transform}
          width={diameter}
          height={diameter}
          viewBox="0 0 100 100"
        >
          <path 
            d={
              shape.type === 'star' ? getStarPath(5) :
              shape.type === 'star6' ? getStarPath(6) :
              shape.type === 'star8' ? getStarPath(8) :
              shape.type === 'triangle' ? getTrianglePath() :
              shape.type === 'triangleDown' ? getTriangleDownPath() :
              shape.type === 'pentagon' ? getPentagonPath() :
              shape.type === 'hexagon' ? getHexagonPath() :
              shape.type === 'octagon' ? getOctagonPath() :
              shape.type === 'heart' ? getHeartPath() :
              shape.type === 'crescent' ? getCrescentPath() :
              shape.type === 'cross' ? getCrossPath() :
              getPlusPath()
            } 
            fill={shape.color} 
          />
        </svg>
      {/if}
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
    width: 100%;
    height: 100%;
  }

  .shape {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    will-change: transform;
  }

  .shape-background {
    border-radius: 50%;
  }

  .shape-circle {
    border-radius: 50%;
  }

  .shape-square {
    border-radius: 0;
  }

  .shape-diamond {
    border-radius: 0;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  .shape-svg {
    pointer-events: none;
  }
</style>
