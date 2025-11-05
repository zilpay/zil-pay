<script lang="ts">
  const SHAPE_CIRCLE = 0;
  const SHAPE_STAR = 1;
  const SHAPE_STAR6 = 2;
  const SHAPE_STAR8 = 3;
  const SHAPE_TRIANGLE = 4;
  const SHAPE_TRIANGLE_DOWN = 5;
  const SHAPE_SQUARE = 6;
  const SHAPE_DIAMOND = 7;
  const SHAPE_PENTAGON = 8;
  const SHAPE_HEXAGON = 9;
  const SHAPE_OCTAGON = 10;
  const SHAPE_HEART = 11;
  const SHAPE_CRESCENT = 12;
  const SHAPE_CROSS = 13;
  const SHAPE_PLUS = 14;

  type ShapeConfig = {
    color: string;
    transform: string;
    type: number;
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

  const COLORS = [
    '#FF007A', '#FF1A8C', '#FF339E', '#FF4DB0', '#FF66C2',
    '#AC59FF', '#B66CFF', '#C07FFF', '#CA92FF', '#D4A5FF',
    '#00D4FF', '#1AD9FF', '#33DEFF', '#4DE3FF', '#66E8FF',
    '#FF6B35', '#FF7D4D', '#FF8F66', '#FFA17F', '#FFB399',
    '#43CC71', '#56D183', '#69D695', '#7CDBA7', '#8FE0B9',
    '#FFD700', '#FFDB1A', '#FFDF33', '#FFE34D', '#FFE766',
    '#8B5CF6', '#9B70F7', '#AB84F8', '#BB98F9', '#CBACFA',
    '#EC4899', '#EE5CA5', '#F070B1', '#F284BD', '#F498C9',
    '#10B981', '#24C290', '#38CB9F', '#4CD4AE', '#60DDBD',
    '#F59E0B', '#F6A922', '#F7B439', '#F8BF50', '#F9CA67',
    '#6366F1', '#7477F2', '#8588F3', '#9699F4', '#A7AAF5',
    '#EF4444', '#F05757', '#F16A6A', '#F27D7D', '#F39090',
    '#14B8A6', '#28C1B5', '#3CCAC4', '#50D3D3', '#64DCE2',
    '#F97316', '#FA832D', '#FB9344', '#FCA35B', '#FDB372',
    '#8B5A3C', '#996853', '#A7766A', '#B58481', '#C39298',
    '#2DD4BF', '#41D9C8', '#55DED1', '#69E3DA', '#7DE8E3',
    '#FB923C', '#FC9D53', '#FDA86A', '#FEB381', '#FFBE98',
    '#C026D3', '#C63AD9', '#CC4EDF', '#D262E5', '#D876EB',
    '#38BDF8', '#4CC4F9', '#60CBFA', '#74D2FB', '#88D9FC',
    '#FBBF24', '#FCC43B', '#FDC952', '#FECE69', '#FFD380',
    '#A78BFA', '#B39DFB', '#BFAFFC', '#CBC1FD', '#D7D3FE',
    '#F472B6', '#F686C2', '#F89ACE', '#FAADDA', '#FCC1E6',
    '#34D399', '#48D9A7', '#5CDFB5', '#70E5C3', '#84EBD1',
    '#FBBF24', '#FCC53B', '#FDCB52', '#FED169', '#FFD780',
    '#818CF8', '#9299F9', '#A3A6FA', '#B4B3FB', '#C5C0FC'
  ];

  const SHAPE_TYPES = new Uint8Array([
    SHAPE_CIRCLE, SHAPE_STAR, SHAPE_STAR6, SHAPE_STAR8, 
    SHAPE_TRIANGLE, SHAPE_TRIANGLE_DOWN, SHAPE_SQUARE, SHAPE_DIAMOND,
    SHAPE_PENTAGON, SHAPE_HEXAGON, SHAPE_OCTAGON, SHAPE_HEART,
    SHAPE_CRESCENT, SHAPE_CROSS, SHAPE_PLUS
  ]);

  const PATH_CACHE = new Map<number, string>();

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

  function colorDistance(color1: string, color2: string): number {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    return Math.sqrt(
      Math.pow(r2 - r1, 2) +
      Math.pow(g2 - g1, 2) +
      Math.pow(b2 - b1, 2)
    );
  }

  function getStarPath(points: number): string {
    if (PATH_CACHE.has(points)) {
      return PATH_CACHE.get(points)!;
    }

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
    
    const result = path + 'Z';
    PATH_CACHE.set(points, result);
    return result;
  }

  function getPolygonPath(points: number, key: number): string {
    if (PATH_CACHE.has(key)) {
      return PATH_CACHE.get(key)!;
    }

    const angle = (Math.PI * 2) / points;
    const radius = 45;
    
    let path = '';
    for (let i = 0; i < points; i++) {
      const currentAngle = angle * i - Math.PI / 2;
      const x = 50 + Math.cos(currentAngle) * radius;
      const y = 50 + Math.sin(currentAngle) * radius;
      path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }
    
    const result = path + 'Z';
    PATH_CACHE.set(key, result);
    return result;
  }

  function getShapePath(type: number): string {
    if (PATH_CACHE.has(type + 100)) {
      return PATH_CACHE.get(type + 100)!;
    }

    let path = '';
    switch (type) {
      case SHAPE_STAR:
        path = getStarPath(5);
        break;
      case SHAPE_STAR6:
        path = getStarPath(6);
        break;
      case SHAPE_STAR8:
        path = getStarPath(8);
        break;
      case SHAPE_TRIANGLE:
        path = 'M 50 15 L 85 85 L 15 85 Z';
        break;
      case SHAPE_TRIANGLE_DOWN:
        path = 'M 50 85 L 15 15 L 85 15 Z';
        break;
      case SHAPE_PENTAGON:
        path = getPolygonPath(5, 200);
        break;
      case SHAPE_HEXAGON:
        path = getPolygonPath(6, 201);
        break;
      case SHAPE_OCTAGON:
        path = getPolygonPath(8, 202);
        break;
      case SHAPE_HEART:
        path = 'M 50 85 C 50 85 20 60 20 40 C 20 25 30 15 40 15 C 45 15 50 20 50 20 C 50 20 55 15 60 15 C 70 15 80 25 80 40 C 80 60 50 85 50 85 Z';
        break;
      case SHAPE_CRESCENT:
        path = 'M 50 10 A 40 40 0 1 1 50 90 A 35 35 0 1 0 50 10 Z';
        break;
      case SHAPE_CROSS:
        path = 'M 35 15 L 65 15 L 65 35 L 85 35 L 85 65 L 65 65 L 65 85 L 35 85 L 35 65 L 15 65 L 15 35 L 35 35 Z';
        break;
      case SHAPE_PLUS:
        path = 'M 40 10 L 60 10 L 60 40 L 90 40 L 90 60 L 60 60 L 60 90 L 40 90 L 40 60 L 10 60 L 10 40 L 40 40 Z';
        break;
    }
    
    if (path) {
      PATH_CACHE.set(type + 100, path);
    }
    return path;
  }

  const shapes = $derived(() => {
    if (!seed) return [];
    
    const random = mulberry32(generateSeedFromString(seed));
    const usedColors = new Uint8Array(COLORS.length);
    const MIN_COLOR_DISTANCE = 80;

    function genColor(previousColor: string | null = null): string {
      let availableIndices: number[] = [];
      
      for (let i = 0; i < COLORS.length; i++) {
        if (usedColors[i]) continue;
        
        const color = COLORS[i];
        if (previousColor && colorDistance(color, previousColor) < MIN_COLOR_DISTANCE) {
          continue;
        }
        
        availableIndices.push(i);
      }

      if (availableIndices.length === 0) {
        usedColors.fill(0);
        const idx = Math.floor(random() * COLORS.length);
        usedColors[idx] = 1;
        return COLORS[idx];
      }

      const idx = availableIndices[Math.floor(random() * availableIndices.length)];
      usedColors[idx] = 1;
      return COLORS[idx];
    }

    function genShapeType(): number {
      return SHAPE_TYPES[Math.floor(random() * SHAPE_TYPES.length)];
    }
    
    const shapeConfigs: ShapeConfig[] = [];
    const backgroundColor = genColor();
    shapeConfigs.push({
      color: backgroundColor,
      transform: '',
      type: SHAPE_CIRCLE
    });

    const center = diameter / 2;
    const maxRadius = diameter / 2.2;

    for (let i = 0; i < shapeCount - 1; i++) {
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
      
      const transform = `translate(${tx.toFixed(3)}px,${ty.toFixed(3)}px) translate(${center}px,${center}px) rotate(${rot.toFixed(3)}deg) scale(${scale.toFixed(3)}) translate(${-center}px,${-center}px)`;

      const previousColor = shapeConfigs[shapeConfigs.length - 1]?.color;

      shapeConfigs.push({
        color: genColor(previousColor),
        transform,
        type: genShapeType()
      });
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
      {:else if shape.type === SHAPE_CIRCLE || shape.type === SHAPE_SQUARE || shape.type === SHAPE_DIAMOND}
        <div 
          class="shape shape-{shape.type === SHAPE_CIRCLE ? 'circle' : shape.type === SHAPE_SQUARE ? 'square' : 'diamond'}"
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
            d={getShapePath(shape.type)}
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

