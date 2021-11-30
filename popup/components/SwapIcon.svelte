<script lang="ts">
  export let width = '36';
  export let height = '36';
  export let selected = false;
</script>

<svg
  width={width}
  height={height}
  class:selected={selected}
  viewBox="0 0 36 37"
  fill="none"
>
  <path d="M11.3441 9.96148L25.0027 9.96148L25.0027 12.9615L11.3441 12.9615V17.0579L5.47217 11.5908L11.3441 6.12366V9.96148Z"/>
  <path d="M25.0027 28.0509V30.026V32.1474L30.4699 26.6802L25.0027 21.2131V23.3344V25.0509L10.9393 25.0509L10.9393 28.0509L25.0027 28.0509Z"/>
</svg>

<style lang="scss">
  svg {
    cursor: pointer;

    & > path {
      fill: var(--muted-color);
    }
  }
  svg.selected {
    cursor: auto;

    & > path {
      fill: var(--primary-color);
    }
  }
</style>
