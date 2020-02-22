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
  data() {
    return {
    }
  },
  methods: {
    onModal() {
      this.$emit('input', !this.value)
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

    background-color: var(--app-background-color);

    height: fit-content;

    animation: fadeInUp 0.5s;
    animation-timing-function: cubic-bezier(.3,.17,.23,.96);
  }

  &__close {
    cursor: pointer;

    top: 0;

    background-color: var(--accent-color-black);

    z-index: 5;

    animation: fade 0.5s;

    animation-timing-function: cubic-bezier(.3,.17,.23,.96);

    opacity: 0.5;
  }
}
</style>
