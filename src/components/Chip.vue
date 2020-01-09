<template>
  <div
    :class="b({ pointer, size })"
    @click="onClick"
  >
    <div :class="b('wrapper')">
      <div :class="b('circle')">
        {{ circle }}
      </div>
      <div :class="b('content')">
        <slot />
      </div>
      <CloseIcon
        :class="b('close', { close })"
        @click="onClose"
      />
    </div>
  </div>
</template>

<script>
import { SIZE_VARIANS, EVENTS } from '@/config'

import CloseIcon from '@/components/icons/Close'

export default {
  name: 'Chip',
  components: {
    CloseIcon
  },
  props: {
    circle: {
      type: [String, Number],
      required: false
    },
    pointer: {
      type: Boolean,
      default: false
    },
    close: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: SIZE_VARIANS.sm
    }
  },
  methods: {
    onClose() {
      this.$emit(EVENTS.close)
    },
    onClick() {
      this.$emit(EVENTS.click)
    }
  }
}
</script>

<style lang="scss">
$default-height: 32px;

.Chip {
  display: inline-block;

  height: $default-height;
  width: 100px;

  color: var(--theme-color-font);
  line-height: $default-height;

  border-radius: 16px;
  background-color: var(--theme-color-input);

  &__wrapper {
    display: grid;
    grid-template-columns: $default-height 1fr $default-height;
    justify-content: space-between;
  }

  &__circle {
    height: $default-height;
    width: $default-height;

    border-radius: 16px;
    background-color: var(--accent-color-info);

    text-align: center;
  }

  &__content {
    text-indent: 5px;
  }

  &__close {
    display: none;

    height: 32px;
    width: 32px;
    text-align: center;

    &_close {
      display: flex;
    }
  }

  &_pointer {
    cursor: pointer;
  }

  &_size-xs {
    font-size: var(--size-xs-font);
  }

  &_size-sm {
    font-size: calc(var(--size-sm-font) - 5px);
  }

  &_size-md {
    font-size: var(--size-md-font);
  }

  &_size-lg {
    font-size: var(--size-lg-font);
  }
}
</style>
