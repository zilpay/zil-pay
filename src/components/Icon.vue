/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
<template>
  <img
    :class="b({ pointer })"
    :src="src"
    :height="height"
    :width="width"
  >
</template>

<script>
import { ICON_TYPE } from '@/config'

/**
 * @example
 * import { ICON_TYPE } from '@/config'
 * import Icon from '@/components/Icon'
 * <Icon :icon="ICON_VARIANTS.logo" />
 */
export default {
  name: 'Icon',
  props: {
    icon: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: ICON_TYPE.svg
    },
    height: {
      type: [Number, String],
      default: 100
    },
    width: {
      type: [Number, String],
      default: 100
    },
    pointer: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    src() {
      return `/icons/${this.icon}.${this.type}`
    }
  }
}
</script>

<style lang="scss">
.Icon {
  &_pointer {
    cursor: pointer;
  }
}
</style>
