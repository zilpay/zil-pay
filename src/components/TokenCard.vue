<template>
  <div :class="b({ selected })">
    <Icon
      :type="ICON_TYPE.auto"
      :icon="tokenImage"
      @click="onSelected"
    />
    <div @click="onSelected">
      <div>
        <Title
          :size="SIZE_VARIANS.sm"
          :font="FONT_VARIANTS.regular"
        >
          {{ balance | fromZil(decimals) | toLocaleString }}
        </Title>
        <P
          :size="SIZE_VARIANS.sm"
        >
          {{ symbol }}
        </P>
      </div>
      <div>
        <span
          :size="SIZE_VARIANS.sm"
          :variant="COLOR_VARIANTS.gray"
          class="subtitle"
        >
          {{ balance | toConversion(rate, decimals) | toLocaleString }}
        </span>
        <P
          :size="SIZE_VARIANS.xs"
          :font="FONT_VARIANTS.bold"
          :variant="COLOR_VARIANTS.gray"
        >
          {{ tokenCurrency }}
        </P>
      </div>
    </div>
    <span
      v-show="DEFAULT_TOKEN.symbol !== symbol && !defaultToken"
      :class="b('rm')"
      @click="onRemove"
    >
      <SvgInject :variant="ICON_VARIANTS.close"/>
    </span>
  </div>
</template>

<script>
import { DEFAULT_TOKEN } from 'config'
import { toBech32Address } from '@zilliqa-js/crypto/dist/bech32'

import { mapState } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import {
  FONT_VARIANTS,
  SIZE_VARIANS,
  ICON_VARIANTS,
  ICON_TYPE,
  COLOR_VARIANTS,
  EVENTS
} from '@/config'

import Title from '@/components/Title'
import P from '@/components/P'
import SvgInject from '@/components/SvgInject'
import Icon from '@/components/Icon'

import { getTokenImage } from '@/utils'
import { toConversion, fromZil, toLocaleString } from '@/filters'

export default {
  name: 'TokenCard',
  filters: { toConversion, fromZil, toLocaleString },
  components: {
    SvgInject,
    Icon,
    P,
    Title
  },
  props: {
    selected: {
      type: Boolean,
      default: false
    },
    decimals: {
      type: [Number, String],
      required: true
    },
    address: {
      type: String
    },
    balance: {
      type: String,
      required: true
    },
    symbol: {
      type: String,
      required: true
    },
    defaultToken: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      FONT_VARIANTS,
      ICON_VARIANTS,
      ICON_TYPE,
      SIZE_VARIANS,
      DEFAULT_TOKEN,
      COLOR_VARIANTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.selectedTheme
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.currency,
      settingsStore.STATE_NAMES.currentCurrency,
      settingsStore.STATE_NAMES.currentRate
    ]),

    isDark() {
      return this.selectedTheme === 'dark'
    },
    tokenImage() {
      if (this.symbol === DEFAULT_TOKEN.symbol) {
        return getTokenImage(this.symbol, this.isDark)
      }

      try {
        const bech32 = toBech32Address(this.address)

        return getTokenImage(bech32, this.isDark)
      } catch {
        return getTokenImage(this.address, this.isDark)
      }
    },
    tokenCurrency() {
      if (this.symbol === DEFAULT_TOKEN.symbol) {
        return this.currency
      }

      return DEFAULT_TOKEN.symbol
    },
    rate() {
      try {
        if (this.symbol === DEFAULT_TOKEN.symbol) {
          return this.currentRate[this.symbol][this.currency]
        }

        return this.currentRate[this.symbol][DEFAULT_TOKEN.symbol]
      } catch (err) {
        return 0
      }
    }
  },
  methods: {
    onSelected() {
      this.$emit(EVENTS.click)
    },
    onRemove() {
      this.$emit(EVENTS.remove)
    }
  }
}
</script>

<style lang="scss">
.TokenCard {
  align-items: center;
  box-shadow: inset 1px 1px 15px var(--accent-color-second);
  border-radius: 10px;
  display: flex;
  cursor: pointer;
  padding: 8px 10px;

  img {
    max-width: 30px;
    height: auto;
  }

  svg {
    transform: rotate(180deg);

    path {
      stroke: var(--accent-color-primary);
    }
  }

  & > div {
    width: 100%;
    margin-left: 10px;
  }

  & > div > div {
    display: flex;
    align-items: center;

    &:nth-child(2) {
      margin-top: 3px;
      padding-left: 2px;
    }

    & > .Title {
      font-size: 1.5em;
      margin-bottom: 0;
    }

    & > .P {
      margin-left: 4px;
    }
  }

  &__rm {
    width: 30px;

    & > svg {
      height: 15px;
    }

    &:hover {
      & > svg > line {
        stroke: var(--accent-color-primary);
      }
    }
  }

  &_selected {
    border: 2px solid var(--accent-color-primary);
  }
}
</style>
