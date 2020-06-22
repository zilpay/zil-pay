<template>
  <Container :class="b()">
    <div :class="b('fee')">
      <Input
        :value="value.gasLimit"
        :type="INPUT_TYPES.number"
        :step="DEFAULT.gasLimit"
        :min="DEFAULT.gasLimit"
        title="Gas Limit"
        block
        round
        @input="onGasLimit"
      />
      <hr :class="b('hr')"/>
      <Input
        :value="value.gasPrice"
        :type="INPUT_TYPES.number"
        :step="DEFAULT.gasPrice"
        :min="DEFAULT.gasPrice"
        title="Gas Price (Li)"
        block
        round
        @input="onGasPrice"
      />
    </div>
    <DoubleRange
      v-model="range"
      :min="DEFAULT.gasLimit"
      @input="onFactor"
    />
    <div :class="b('info')">
      <P :font="FONT_VARIANTS.bold">
        Fee
      </P>
      <P :font="FONT_VARIANTS.bold">
        {{ fee }}
      </P>
    </div>
  </Container>
</template>

<script>
import { FONT_VARIANTS, EVENTS } from '@/config'

import Container from '@/components/Container'
import Input, { INPUT_TYPES } from '@/components/Input'
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
    Container,
    Input,
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

      range: [
        this.DEFAULT.gasLimit,
        MAX_RANGE
      ],
      startedGas: null
    }
  },
  computed: {
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
  }

  &__hr {
    margin-top: 12px;
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
