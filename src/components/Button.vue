/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
<template>
  <button
    :class="b({ round, block, size, color })"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script>
import {
  COLOR_VARIANTS,
  SIZE_VARIANS
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
  }
}
</script>

<style lang="scss">
.Button {
  cursor: pointer;

  box-sizing: border-box;
  font-family: var(--font-family-medium);
  font-style: normal;
  font-weight: 500;
  font-size: 21px;
  line-height: 31px;

  border: 0;
  outline: none;
}

.Button {
  &_round {
    border-radius: .25rem;
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
  }

  &_color-white {
    background-color: var(--accent-color-white);
  }

  &_color-gray {
    background-color: var(--accent-color-gray);
  }

  &_color-success {
    background-color: var(--accent-color-success);
  }

  &_color-info {
    background-color: var(--accent-color-info);
  }

  &_color-danger {
    background-color: var(--accent-color-danger);
  }

  &_color-transparent {
    background: transparent;
    border: 1px solid var(--accent-color-black);
  }
}

.Button {
  &_size-xs {
    padding: var(--size-xs);
  }

  &_size-sm {
    padding: var(--size-sm);
  }

  &_size-md {
    padding: var(--size-md);
  }

  &_size-lg {
    padding: var(--size-lg);
  }
}

.Button {
  &[disabled="disabled"] {
    cursor: unset;
    opacity: 0.5;
  }
}
</style>
