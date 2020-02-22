<template>
  <div :class="b()" :style="color">
    <Icon
      v-show="selected"
      :class="b('selected')"
      :icon="ICON_VARIANTS.selected"
      width="14"
      height="14"
      @click="onSelectedCard"
    />
    <Title
      :class="b('name')"
      @click="onSelectedCard"
    >
      {{ name }}
    </Title>
    <div :class="b('wrapper')">
      <div
        :class="b('balance')"
        @click="onSelectedCard"
      >
        <Icon
          :class="b('zil-watermark')"
          :icon="watermarkIcon"
          width="25"
          height="35"
          @click="onSelectedCard"
        />
        <P
          :class="b('zil')"
          :font="FONT_VARIANTS.medium"
          :variant="COLOR_VARIANTS.gray"
          @click="onSelectedCard"
        >
          ZIL{{ account.balance | fromZil }}
        </P>
        <P
          :class="b('currency')"
          :font="FONT_VARIANTS.medium"
          :variant="COLOR_VARIANTS.gray"
          @click="onSelectedCard"
        >
          {{ currency }}{{ account.balance | toConversion(getRate) }}
        </P>
      </div>
      <Trash
        v-show="trash"
        :class="b('remove')"
        width="13"
        height="16"
        @click="onRemove"
      />
    </div>
    <P
      v-tooltip="copytitle"
      :class="b('address')"
      :size="SIZE_VARIANS.xs"
      :font="FONT_VARIANTS.medium"
      :variant="COLOR_VARIANTS.gray"
      :content="account.address | toAddress(addressFormat, false)"
      copy
      @copy="onCopyMixin"
    >
      {{ account.address | toAddress(addressFormat, false) }}
    </P>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import {
  FONT_VARIANTS,
  SIZE_VARIANS,
  ICON_VARIANTS,
  COLOR_VARIANTS,
  HW_VARIANTS,
  ADDRESS_FORMAT_VARIANTS,
  EVENTS
} from '@/config'

import { fromZil, toConversion, toAddress } from '@/filters'
import CopyMixin from '@/mixins/copy'

import Title from '@/components/Title'
import P from '@/components/P'
import Icon from '@/components/Icon'
import Trash from '@/components/icons/Trash'

/**
 * Account card component show some information about [balance, address, type].
 * @param account Is full account object.
 * @param selected Show icons `selected`.
 * @param trash Show trash icon.
 * @event selected Select new account, returns account object.
 * @event remove Remove account, returns account object.
 * @example
 * import AccountCard from '@/components/AccountCard'
 * const acc = {
 *   address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F',
 *   balance: '463851500000000',
 *   index: 0,
 *   name: 'Account 0'
 * },
 * <AccountCard
 *   :account="acc"
 *   :selected="true" // This account has as selected.
 *   :trash="true" // If can remove, emiting `remove` event.
 * />
 */
export default {
  name: 'AccountCard',
  components: {
    Title,
    Icon,
    Trash,
    P
  },
  mixins: [CopyMixin],
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
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat,
      settingsStore.STATE_NAMES.currency
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getRate
    ]),

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
    },
    name() {
      if (this.account.name) {
        return this.account.name
      }

      return `${this.local.ACCOUNT} ${this.account.index}`
    }
  },
  mounted() {
    [
      'address',
      'balance',
      'index'
    ].forEach(key => {
      if (!(key in this.account)) {
        throw new Error(`Property ${key} is required.`)
      }
    })
  },
  methods: {
    onSelectedCard() {
      this.$emit(EVENTS.selected, this.account)
    },
    onRemove() {
      this.$emit(EVENTS.remove, this.account)
    },

    addressToColor(hex) {
      let rgb = this.hexToRgb(hex.slice(-6))

      rgb.r = rgb.r > 150 ? 150 : rgb.r
      rgb.g = rgb.g > 200 ? 200 : rgb.g
      rgb.b = rgb.b > 100 ? 100 : rgb.b

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

  &__wrapper {
    display: grid;
    grid-template-columns: 1fr 30px;
    align-items: center;
  }

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
