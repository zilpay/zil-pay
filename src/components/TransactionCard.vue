<template>
  <div
    :class="b()"
    @click="onClick"
  >
    <Icon
      :icon="statusIcon"
      height="15"
      width="15"
    />
    <div :class="b('wrapper')">
      <div :class="b('first-line')">
        <P
          :class="b('send')"
          :font="FONT_VARIANTS.bold"
        >
          {{ txType }}
        </P>
        <P
          :class="b('zil')"
          :font="FONT_VARIANTS.light"
        >
          -{{ transaction.amount | fromZil(token.decimals) | toLocaleString }} {{ token.symbol }}
        </P>
      </div>
      <div :class="b('thirdly-line')">
        <P
          :class="b('time')"
          :variant="COLOR_VARIANTS.gray"
          :font="FONT_VARIANTS.regular"
        >
          {{ timeStamp }}
        </P>
        <P
          :class="b('amount')"
          :variant="COLOR_VARIANTS.gray"
          :font="FONT_VARIANTS.regular"
        >
          -{{ transaction.amount | toConversion(getRate, token.decimals) | toLocaleString }} {{ currency }}
        </P>
      </div>
    </div>
  </div>
</template>

<script>
import { DEFAULT_TOKEN } from 'config'

import { mapState, mapGetters } from 'vuex'
import uiStore from '@/store/ui'
import tokenStore from '@/store/token'
import settingsStore from '@/store/settings'

import {
  ICON_VARIANTS,
  FONT_VARIANTS,
  COLOR_VARIANTS,
  SIZE_VARIANS,
  EVENTS
} from '@/config'

import P from '@/components/P'
import Icon from '@/components/Icon'

import { fromZil, toConversion, toLocaleString } from '@/filters'

export default {
  name: 'TransactionCard',
  components: {
    P,
    Icon
  },
  filters: { fromZil, toConversion, toLocaleString },
  props: {
    transaction: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      ICON_VARIANTS,
      FONT_VARIANTS,
      COLOR_VARIANTS,
      SIZE_VARIANS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.currency,
      settingsStore.STATE_NAMES.currentRate
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getRate
    ]),
    ...mapGetters(tokenStore.STORE_NAME, [
      tokenStore.GETTERS_NAMES.getSelectedToken
    ]),

    getRate() {
      let { symbol } = this.transaction

      if (!symbol) {
        symbol = DEFAULT_TOKEN.symbol
      }

      try {
        return this.currentRate[symbol][this.currency]
      } catch (err) {
        return 0
      }
    },
    txType() {
      const { symbol, decimals, cancel, type } = this.transaction

      if (cancel) {
        return this.local.CANCELED
      } else if (symbol && decimals) {
        return this.local.TRANSFER
      } else if (type === 1) {
        return this.local.TRIGGER
      } else if (type === 2) {
        return this.local.DEPLOY
      }

      return this.local.SEND
    },
    token() {
      let { symbol, decimals } = this.transaction

      if (symbol === DEFAULT_TOKEN.symbol) {
        return DEFAULT_TOKEN
      }

      if (symbol) {
        return {
          symbol,
          decimals
        }
      }

      return DEFAULT_TOKEN
    },
    statusIcon() {
      if (!this.transaction.confirmed) {
        return ICON_VARIANTS.statusPadding
      } else if (this.transaction.error || this.transaction.cancel) {
        return ICON_VARIANTS.statusDanger
      }

      return ICON_VARIANTS.statusSuccess
    },
    timeStamp() {
      if (!this.transaction.timestamp) {
        return `${this.local.EPOCH} ${this.transaction.block}`
      }

      return new Date(this.transaction.timestamp).toDateString()
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
.TransactionCard {
  display: flex;
  justify-content: space-between;
  align-items: center;

  cursor: pointer;

  border-radius: 7px;
  background-color: var(--opacity-bg-element-1);
  padding: 8px;

  max-height: 40px;

  &__wrapper {
    width: 100%;
  }

  &__first-line,
  &__second-line,
  &__thirdly-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-height: 20px;
  }

  &__thirdly-line,
  &__first-line {
    padding-left: 15px;
    padding-right: 15px;
  }

  &__send,
  &__zil {
    font-size: 14px;
    line-height: 25px;
  }

  &__amount,
  &__time {
    font-size: 12px;
    line-height: 20px;
  }
}
</style>
