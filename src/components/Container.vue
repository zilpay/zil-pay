<template>
  <div :class="b()">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Container'
}
</script>

<style lang="scss">
/**
 * 1. Centers the content. Yes, it's a bit opinionated.
 * 2. See the "width vs max-width" section
 */
.Container {
  max-width: 100vw;

  margin-right: auto; /* 1 */
  margin-left:  auto; /* 1 */
}
</style>
