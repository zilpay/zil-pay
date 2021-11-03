<script lang="ts">
  export let width = '36px';
  export let height = '36px';
</script>

<svg
  width={width}
  height={height}
  viewBox="0 0 36 36"
  fill="none"
>
  <path
    d="M10 12H26M10 18H26M10 24H26"
    stroke="#01B2C9"
    stroke-width="2"
  />
</svg>

<style lang="scss">
  @import "../styles/mixins";
  svg {
    cursor: pointer;

    & > path {
      stroke: var(--primary-color);
    }
  }
</style>
