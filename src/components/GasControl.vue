<template>
  <div :class="b()">
    <div :class="b('fee')">
      <label>
        {{ local.GAS_LIMIT }}
        <input
          :value="value.gasLimit"
          :type="INPUT_TYPES.number"
          :step="DEFAULT.gasLimit"
          :min="DEFAULT.gasLimit"
          @input="onGasLimit"
        >
      </label>
      <hr :class="b('hr')"/>
      <label>
        {{ local.GAS_PRICE }}
        <input
          :value="value.gasPrice"
          :type="INPUT_TYPES.number"
          :step="DEFAULT.gasPrice"
          :min="DEFAULT.gasPrice"
          block
          round
          @input="onGasPrice"
        >
      </label>
    </div>
    <DoubleRange
      v-model="range"
      :min="DEFAULT.gasLimit"
      @input="onFactor"
    />
    <div :class="b('info')">
      <P
        :font="FONT_VARIANTS.bold"
        :size="SIZE_VARIANS.sm"
      >
        {{ local.FEE }}
      </P>
      <P
        :font="FONT_VARIANTS.bold"
        :size="SIZE_VARIANS.sm"
      >
        {{ fee }} {{ DEFAULT_TOKEN.symbol }}
      </P>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import { DEFAULT_TOKEN } from 'config'
import { FONT_VARIANTS, EVENTS, SIZE_VARIANS } from '@/config'

import { INPUT_TYPES } from '@/components/Input'
import DoubleRange from '@/components/DoubleRange'
import P from '@/components/P'

import CalcMixin from '@/mixins/calc'

const MAX_RANGE = 100

/**
 * Change gas.
 * @param value Vue model schema.
 * @param DEFAULT Is values for calculate gas.
 * @event input Vue model schema.
 * @example
 * import GasControl from '@/components/GasControl'
 * const gas = {
 *   gasPrice: 1000,
 *   gasLimit: 1
 * }
 * <GasControl
 *   v-model="gas"
 *   :DEFAULT="DEFAULT_GAS_FEE"
 * />
 */
export default {
  name: 'GasControl',
  mixins: [CalcMixin],
  components: {
    DoubleRange,
    P
  },
  props: {
    value: {
      type: Object,
      required: true
    },
    DEFAULT: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      FONT_VARIANTS,
      INPUT_TYPES,
      DEFAULT_TOKEN,
      SIZE_VARIANS,

      range: [
        this.DEFAULT.gasLimit,
        MAX_RANGE
      ],
      startedGas: null
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),

    fee() {
      const { gasLimit, gasPrice } = this.value

      return this.calcFee(gasLimit, gasPrice)
    }
  },
  methods: {
    onFactor() {
      const [limit, price] = this.range
      const gas = {
        gasLimit: Math.round(this.startedGas.gasLimit * limit),
        gasPrice: Math.round(this.startedGas.gasPrice * ((MAX_RANGE + 1) - price))
      }

      this.$emit(EVENTS.input, gas)
    },
    onGasPrice(value) {
      this.$emit(EVENTS.input, {
        ...this.value,
        gasPrice: Number(value)
      })
    },
    onGasLimit(value) {
      this.$emit(EVENTS.input, {
        ...this.value,
        gasLimit: Number(value)
      })
    }
  },
  mounted() {
    this.startedGas = this.value
  }
}
</script>

<style lang="scss">
.GasControl {
  display: grid;
  grid-gap: 15px;

  &__fee {
    display: grid;
    grid-template-columns: 100px 50px 100px;
    align-items: center;
    justify-items: center;

    & > label {
      color: var(--accent-color-primary);
      font-size: var(--size-xs-font);
    }

    & > label > input {
      display: block;
      width: 100%;
      max-width: 80px;
      border: 0;
      padding: 8px;
      background-color: var(--opacity-bg-element-2);
      color: var(--theme-color-font);
      border-radius: 5px;
    }
  }

  &__hr {
    margin-top: 20px;
    width: 40px;
    color: var(--accent-color-second);
  }

  &__info {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
  }
}
</style>
