/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
<template>
  <p :class="b({ variant, font })">
    <slot />
  </p>
</template>

<script>
import {
  COLOR_VARIANTS,
  FONT_VARIANTS
} from '@/config'

/**
 * @example
 * import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'
 * import P from '@/components/P'
 * <P :variant="COLOR_VARIANTS.black">My content</P>
 */
export default {
  name: 'P',
  props: {
    variant: {
      type: String,
      default: COLOR_VARIANTS.black
    },
    font: {
      type: String,
      default: FONT_VARIANTS.light
    }
  }
}
</script>

<style lang="scss">
.P {
  font-style: normal;
  font-weight: normal;
  font-size: 22px;
  line-height: 32px;

  &_variant-black {
    color: var(--accent-color-black);
  }

  &_font-PoppinsLight {
    font-family: var(--font-family-light);
  }
}
</style>
