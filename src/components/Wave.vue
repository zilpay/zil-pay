<template>
  <img
    :class="b()"
    src="/illustrations/wave.svg"
  >
</template>

<script>
/**
 * Just illustration wave.
 * @example
 * import Wave from '@/components/Wave'
 * <Wave />
 */
export default {
  name: 'Wave'
}
</script>

<style lang="scss">
.Wave {
  position: fixed;
  z-index: -1;
  bottom: 0;
  left: 0;
  right: 0;

  width: 100%;
  max-width: 100vw;
}
</style>
