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
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M6.53126 6.98755H16.6005V17.0568H6.53126V6.98755ZM9.53126 9.98755H13.6005V14.0568H9.53126V9.98755Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M19.9308 20.9149H30V30.9841H19.9308V20.9149ZM22.9308 23.9149H27V27.9841H22.9308V23.9149Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M30 6.98755V17.0568H19.9308V6.98755H30ZM22.9308 9.98755H27V14.0568H22.9308V9.98755Z"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M16.6005 20.9149H6.53125V30.9841H16.6005V20.9149ZM13.6005 23.9149H9.53125V27.9841H13.6005V23.9149Z"
  />
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
