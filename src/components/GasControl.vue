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
        ZIL0.01
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
      ]
    }
  },
  methods: {
    onFactor() {
      const [limit, price] = this.range
      const gas = {
        gasLimit: Math.round(this.DEFAULT.gasLimit * limit),
        gasPrice: Math.round(this.DEFAULT.gasPrice * ((MAX_RANGE + 1) - price))
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
  }
}
</script>

<style lang="scss">
.GasControl {
  &__fee {
    display: grid;
    grid-template-columns: 100px 50px 100px;
    align-items: center;
    justify-items: center;
  }

  &__hr {
    width: 40px;
    color: var(--theme-color-separator);
  }

  &__info {
    display: flex;
    justify-content: space-between;

    padding-top: 15px;
    font-size: 15px;
  }
}
</style>
