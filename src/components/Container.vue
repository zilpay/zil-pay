<template>
  <div
    :class="b()"
    @click="onClick"
  >
    <slot />
  </div>
</template>

<script>
import { EVENTS } from '@/config'

export default {
  name: 'Container',
  methods: {
    onClick() {
      this.$emit(EVENTS.click)
    }
  }
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
