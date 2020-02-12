<template>
  <div
    :class="b({ pointer, size })"
    @click="onClick"
  >
    <div :class="b('wrapper')">
      <div
        v-show="circle"
        :class="b('circle', { color })"
      >
        {{ circle }}
      </div>
      <div :class="b('content')">
        <slot />
      </div>
      <CloseIcon
        v-show="close"
        :size="SIZE_VARIANS.sm"
        opacity
        @click="onClose"
      />
    </div>
  </div>
</template>

<script>
import { SIZE_VARIANS, EVENTS, COLOR_VARIANTS } from '@/config'

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
    color: {
      type: String,
      default: COLOR_VARIANTS.info
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
  data() {
    return {
      SIZE_VARIANS
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

  color: var(--theme-color-font);
  line-height: $default-height;

  border-radius: 16px;
  background-color: var(--theme-color-input);

  &__wrapper {
    display: grid;
    grid-template-columns: auto 1fr 25px;
    justify-content: space-between;
  }

  &__circle {
    height: $default-height;
    width: $default-height;

    border-radius: 16px;

    text-align: center;

    &_color-info {
      background-color: var(--accent-color-info);
    }

    &_color-danger {
      background-color: var(--accent-color-danger);
    }

    &_color-success {
      background-color: var(--accent-color-success);
    }
  }

  &__content {
    text-indent: 5px;
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
