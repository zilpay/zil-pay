<template>
  <div
    :class="b({ pointer })"
    @click="onClick"
  >
    <div :class="b('text-alert')">
      <slot />
    </div>
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
  display: grid;

  grid-template-rows: 1px 1fr 1px;

  width: 100%;
  max-width: 360px;

  background-color: var(--theme-color-alert);

  &__text-alert {
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 5px;
  }

  &_pointer {
    cursor: pointer;
  }

  &:before {
    content: "";
    display: block;

    width: 100%;
    height: 1px;

    background-color: var(--theme-color-alert-border);
  }

  &:after {
    content: "";
    display: block;

    width: 100%;
    height: 1px;

    background-color: var(--theme-color-alert-border);
  }
}
</style>
