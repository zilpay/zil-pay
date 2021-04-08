<template>
  <div :class="b({ pure })">
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
    },
    pure: {
      type: Boolean,
      default: false
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
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  justify-content: center;

  &__social,
  &__close {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  &__social {
    z-index: 10;

    top: 30%;
    bottom: inherit;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    max-width: 500px;

    background-color: var(--accent-color-second);

    border-radius: var(--default-border-radius);

    @media (max-width: 700px) {
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;

      transform: none;

      min-width: 300px;

      border-radius: 0;

      height: fit-content;
      border-top-right-radius: var(--default-border-radius);
      border-top-left-radius: var(--default-border-radius);

      animation: fadeInUp 0.4s;
      animation-timing-function: cubic-bezier(.3,.17,.23,.96);
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

  &_pure {
    & > .BottomModal__social {
      z-index: 10;

      top: 30%;
      bottom: inherit;

      background-color: var(--accent-color-second);

      border-radius: 12px;

      animation: none;
    }
  }
}
</style>
