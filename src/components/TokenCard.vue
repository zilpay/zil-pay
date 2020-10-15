<template>
  <div :class="b({ selected })">
    <Icon
      :type="ICON_TYPE.auto"
      :icon="tokenImage"
      :broken="failTookenImage"
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
          :font="FONT_VARIANTS.bold"
        >
          {{ symbol }}
        </P>
      </div>
      <div>
        <Title
          :size="SIZE_VARIANS.sm"
          :font="FONT_VARIANTS.regular"
          :variant="COLOR_VARIANTS.gray"
        >
          {{ balance | toConversion(rate, decimals) | toLocaleString }}
        </Title>
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
import { API, DEFAULT_TOKEN } from 'config'

import { mapState } from 'vuex'
import settingsStore from '@/store/settings'

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
      API,
      DEFAULT_TOKEN,
      COLOR_VARIANTS
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.currency,
      settingsStore.STATE_NAMES.currentCurrency,
      settingsStore.STATE_NAMES.currentRate
    ]),

    tokenImage() {
      return `${this.API.ZRC2_API}/${this.symbol}.${ICON_TYPE.svg}`
    },
    failTookenImage() {
      return `/icons/${ICON_VARIANTS.generic}.${ICON_TYPE.svg}`
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
  display: flex;
  align-items: center;
  justify-content: space-between;

  max-height: 60px;
  min-height: 70px;
  padding-left: 10px;

  background-color: var(--accent-color-second);
  border-radius: 10px;

  cursor: pointer;

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
    width: 150px;
    display: flex;
    align-items: center;

    font-size: 18px;

    & > .P {
      margin-left: 3px;
    }
  }

  &__rm {
    width: 30px;
    height: 55px;

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
