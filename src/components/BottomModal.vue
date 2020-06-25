<template>
  <div :class="b()">
    <aside
      v-show="value"
      :class="b('social')"
    >
      <slot/>
    </aside>
    <div
      v-show="value"
      :class="b('close')"
      @click="onModal"
    />
  </div>
</template>

<script>
import { EVENTS } from '@/config'

/**
 * Modal which show from bottom.
 * @example
 * import BottomModal from '@/components/BottomModal'
 * const modal = false
 * <BottomModal v-model="modal">
 *   account
 * </BottomModal>
 */
export default {
  name: 'BottomModal',
  props: {
    value: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    onModal() {
      this.$emit(EVENTS.input, !this.value)
    }
  }
}
</script>

<style lang="scss">
.BottomModal {
  &__social,
  &__close {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  &__social {
    z-index: 10;

    top: 40vh;
    bottom: 40vh;
    left: 30%;
    right: 30%;

    background-color: var(--app-background-color);

    border-radius: var(--default-border-radius);

    animation: fadeInUp 0.4s;
    animation-timing-function: cubic-bezier(.3,.17,.23,.96);

    @media (max-width: 700px) {
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;

      border-radius: 0;

      height: fit-content;
      border-top-right-radius: var(--default-border-radius);
      border-top-left-radius: var(--default-border-radius);
    }
  }

  &__close {
    cursor: pointer;

    top: 0;

    background-color: var(--accent-color-black);

    z-index: 5;

    animation: fade 0.4s;
    animation-timing-function: cubic-bezier(.3,.17,.23,.96);

    opacity: 0.5;
  }
}
</style>
