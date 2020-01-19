<template>
  <div :class="b()" :style="color">
    <Icon
      v-show="selected"
      :class="b('selected')"
      :icon="ICON_VARIANTS.selected"
      width="14"
      height="14"
    />
    <Title :class="b('name')">
      {{ account.name }}
    </Title>
    <div :class="b('balance')">
      <Icon
        :class="b('zil-watermark')"
        :icon="watermarkIcon"
        width="25"
        height="35"
      />
      <P
        :class="b('zil')"
        :font="FONT_VARIANTS.medium"
        :variant="COLOR_VARIANTS.gray"
      >
        ZIL{{ account.balance | fromZil }}
      </P>
      <P
        :class="b('currency')"
        :font="FONT_VARIANTS.medium"
        :variant="COLOR_VARIANTS.gray"
      >
        ${{ account.balance | toConversion(0.1) }}
      </P>
      <Trash
        v-show="trash"
        :class="b('remove')"
        width="13"
        height="16"
      />
    </div>
    <P
      :class="b('address')"
      :size="SIZE_VARIANS.xs"
      :font="FONT_VARIANTS.medium"
      :variant="COLOR_VARIANTS.gray"
    >
      {{ account.address | toAddress(ADDRESS_FORMAT_VARIANTS.bech32, false) }}
    </P>
  </div>
</template>

<script>
import {
  FONT_VARIANTS,
  SIZE_VARIANS,
  ICON_VARIANTS,
  COLOR_VARIANTS,
  HW_VARIANTS,
  ADDRESS_FORMAT_VARIANTS
} from '@/config'

import { fromZil, toConversion, toAddress } from '@/filters'

import Title from '@/components/Title'
import P from '@/components/P'
import Icon from '@/components/Icon'
import Trash from '@/components/icons/Trash'

export default {
  name: 'AccountCard',
  components: {
    Title,
    Icon,
    Trash,
    P
  },
  filters: { fromZil, toConversion, toAddress },
  props: {
    account: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      required: true
    },
    trash: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      ICON_VARIANTS,
      COLOR_VARIANTS,
      HW_VARIANTS,
      ADDRESS_FORMAT_VARIANTS
    }
  },
  computed: {
    color() {
      return {
        backgroundColor: this.addressToColor(this.account.address)
      }
    },
    watermarkIcon() {
      if (this.account.hwType === this.HW_VARIANTS.ledger) {
        return this.ICON_VARIANTS.ledgerWatermark
      }

      return this.ICON_VARIANTS.zilliqaWatermark
    }
  },
  mounted() {
    [
      'address',
      'balance',
      'index',
      'name'
    ].forEach(key => {
      if (!(key in this.account)) {
        throw new Error(`Property ${key} is required.`)
      }
    })
  },
  methods: {
    addressToColor(hex) {
      let rgb = this.hexToRgb(hex.slice(-6))

      rgb.b = rgb.b > 250 ? 250 : rgb.b

      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    },
    hexToRgb(hex) {
      const bigint = parseInt(hex, 16)
      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255

      return { r, g, b }
    }
  }
}
</script>

<style lang="scss">
$watermark-color: rgba(0, 0, 0, 0.25);

.AccountCard {
  cursor: pointer;

  width: 330px;
  height: 85px;

  box-shadow: var(--default-box-shadow);
  border-radius: var(--default-border-radius);

  &__selected {
    position: absolute;
    margin: 5px;
  }

  &__name {
    color: $watermark-color;
    font-size: 20px;
    line-height: 23px;
    text-indent: 45px;
    padding-top: 5px;
  }

  &__balance {
    display: grid;
    grid-template-columns: 35px 1fr 1fr 30px;
    justify-items: center;
    align-items: center;

    font-size: 15px;
  }

  &__currency,
  &__zil,
  &__address,
  &__remove {
    opacity: 0.7;
  }

  &__zil-watermark,
  &__currency {
    justify-self: right;
  }

  &__zil {
    text-indent: 10px;
    justify-self: left;
  }

  &__address {
    line-height: 20px;
    text-indent: 10px;
  }
}
</style>
