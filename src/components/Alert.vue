<template>
  <div
    :class="b({ pointer })"
    @click="onClick"
  >
    <slot />
  </div>
</template>

<script>
import { EVENTS } from '@/config'

/**
 * @example
 * import Alert from '@/components/Alert'
 * <Alert>TEST</Alert>
 */
export default {
  name: 'Alert',
  props: {
    pointer: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick() {
      this.$emit(EVENTS.click)
    }
  }
}
</script>

<style lang="scss">
.Alert {
  border-radius: 12px;
  background-color: var(--opacity-bg-element-2);
  padding: 20px;

  &_pointer {
    cursor: pointer;
  }
}
</style>
