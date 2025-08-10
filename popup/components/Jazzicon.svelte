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
    '#fc72ff', '#b0b0b0', '#ffffff', '#f7f7f7', 
    '#000000', '#6c6c6c', '#ff007a', '#00d395', 
    '#ff4d4d', '#ffa500'
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
  
  function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function hexToHsl(hex: string): { h: number, s: number, l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  const shapes = $derived(() => {
    if (!seed) return [];
    
    const random = mulberry32(generateSeedFromString(seed));

    function colorRotate(hex: string, degrees: number): string {
        const hsl = hexToHsl(hex);
        let hue = hsl.h;
        hue = (hue + degrees) % 360;
        hue = hue < 0 ? 360 + hue : hue;
        return hslToHex(hue, hsl.s, hsl.l);
    }
    
    function hueShift(colors: string[]): string[] {
        const wobble = 30;
        const amount = (random() * wobble) - (wobble / 2);
        return colors.map(color => colorRotate(color, amount));
    }
    
    const shiftedColors = hueShift([...THEME_COLORS]);

    function genColor(remainingColors: string[]): string {
      if (remainingColors.length === 0) return '#000000';
      const idx = Math.floor(random() * remainingColors.length);
      return remainingColors.splice(idx, 1)[0];
    }
    
    const shapeConfigs: ShapeConfig[] = [];
    const remainingColors = [...shiftedColors];
    
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
      border-color: var(--primary-purple);
    }
    
    &:focus {
      outline: none;
    }

    &:focus-visible::before {
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 2px var(--background-color), 0 0 0 4px var(--primary-purple);
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

