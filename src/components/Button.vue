<template>
  <button
    v-bind="$attrs"
    :class="b({ round, block, size, color })"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script>
import {
  COLOR_VARIANTS,
  SIZE_VARIANS,
  EVENTS
} from '@/config'

/**
 * @example
 * import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'
 * <Button
 *   :size="SIZE_VARIANS.md"
 *   :color="COLOR_VARIANTS.primary"
 *   round
 *   block
 *  >
 *    {{ button.text }}
 *  </Button>
 */
export default {
  name: 'Button',
  props: {
    size: {
      type: String,
      default: SIZE_VARIANS.xs
    },
    color: {
      type: String,
      default: COLOR_VARIANTS.primary
    },
    disabled: {
      type: Boolean,
      default: false
    },
    round: {
      type: Boolean,
      default: false
    },
    block: {
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
.Button {
  cursor: pointer;
  max-width: 250px;

  box-sizing: border-box;
  font-family: var(--font-family-medium);

  font-size: 12px;

  border: 0;
  outline: none;

  box-shadow: var(--default-box-shadow);
}

.Button {
  &_round {
    border-radius: var(--default-border-radius);
  }

  &_block {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.Button {
  &_color-primary {
    background-color: var(--accent-color-primary);
    color: var(--accent-color-white);
  }

  &_color-white {
    background-color: var(--accent-color-white);
    color: var(--accent-color-block);
  }

  &_color-gray {
    background-color: var(--accent-color-gray);
    color: var(--accent-color-white);
  }

  &_color-success {
    background-color: var(--accent-color-success);
    color: var(--accent-color-white);
  }

  &_color-info {
    background-color: var(--accent-color-info);
  }

  &_color-danger {
    background-color: var(--accent-color-danger);
  }

  &_color-warning {
    background-color: var(--accent-color-warning);
  }

  &_color-transparent {
    color: var(--theme-color-font);
    background: transparent;
    border: 1px solid var(--accent-color-black);
  }
}

.Button {
  &_size-xs {
    height: var(--size-xs);
  }

  &_size-sm {
    height: var(--size-sm);
  }

  &_size-md {
    height: var(--size-md);
  }

  &_size-lg {
    height: var(--size-lg);
  }
}

.Button {
  &[disabled="disabled"] {
    cursor: unset;
    opacity: 0.5;
  }
}
</style>
