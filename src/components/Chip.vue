<template>
  <span
    :class="b({ pointer, size })"
    @click="onClick"
  >
    <span :class="b('circle', { color })">
      {{ circle }}
    </span>
    <span :class="b('content')">
      <P>
        <slot />
      </P>
    </span>
    <span
      v-show="close"
      :class="b('close')"
    >
      <CloseIcon
        :size="SIZE_VARIANS.sm"
        opacity
        @click="onClose"
      />
    </span>
  </span>
</template>

<script>
import { SIZE_VARIANS, EVENTS } from '@/config'

import CloseIcon from '@/components/icons/Close'
import P from '@/components/P'

export default {
  name: 'Chip',
  components: {
    CloseIcon,
    P
  },
  props: {
    circle: {
      type: [String, Number],
      required: false
    },
    color: {
      type: String
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
$default-padding: 10px;

.Chip {
  display: inline-flex;
  align-items: center;

  padding: $default-padding - 5px;

  border-radius: var(--default-border-radius);
  background-color: var(--opacity-bg-element-1);

  &__circle {
    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 50%;
    background-color: var(--theme-negative);
    color: var(--app-background-color);

    width: 25px;
    height: 25px;
  }

  &__content {
    margin-left: $default-padding;
    margin-right: $default-padding;
  }

  &__close {
    margin-right: $default-padding;
  }
}
</style>
