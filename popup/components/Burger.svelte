<script lang="ts">
  export let width = '26';
  export let height = '26';
</script>

<svg
  width={width}
  height={height}
  viewBox="0 0 16 14"
  fill="none"
>
  <path
    d="M0 1H16M0 7H16M0 13H16"
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>

<style lang="scss">
  @import "../styles/mixins";
  svg {
    cursor: pointer;

    & > path {
      stroke: var(--text-color);
    }

    &:hover {
      & > path {
        stroke: var(--primary-color);
      }
    }
  }
</style>
