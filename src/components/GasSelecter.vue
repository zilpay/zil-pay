<template>
  <ul :class="b()">
    <li
      v-for="(el, index) of items"
      :key="index"
      :class="b('i', { selected: index + 1 === selected })"
      @click="onGaschanged(index)"
    >
      <P>
        {{ el.name }}
      </P>
      <P>
        {{ el.value | fromZil(DEFAULT_TOKEN.decimals) }} {{ DEFAULT_TOKEN.symbol }}
      </P>
    </li>
  </ul>
</template>

<script>
import Big from 'big.js'
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import { DEFAULT_TOKEN } from 'config'
import { EVENTS } from '@/config'

import P from '@/components/P'

import { fromZil } from '@/filters'
import CalcMixin, { gasFee } from '@/mixins/calc'

export default {
  name: 'GasSelecter',
  filters: { fromZil },
  mixins: [CalcMixin],
  components: {
    P
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      DEFAULT_TOKEN,
      selected: 1
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),

    items() {
      const { gasLimit, gasPrice } = this.value
      const { _fee } = gasFee(gasPrice, gasLimit)

      return [
        {
          name: this.local.SLOW,
          value: _fee
        },
        {
          name: this.local.AVERAGE,
          value: _fee.mul(2)
        },
        {
          name: this.local.FAST,
          value: _fee.mul(3)
        }
      ]
    }
  },
  methods: {
    onGaschanged(index) {
      const { gasLimit, gasPrice } = this.value

      this.selected = index + 1
      this.$emit(EVENTS.input, {
        gasLimit,
        gasPrice: String(Big(gasPrice).mul(this.selected))
      })
    }
  }
}
</script>

<style lang="scss">
.GasSelecter {
  display: flex;

  border: 1px solid var(--opacity-bg-element-2);
  border-radius: 10px;

  padding: 0;
  list-style: none;

  &__i {
    cursor: pointer;

    padding: 5px;
    text-align: center;
    min-width: 80px;

    &_selected {
      background-color: var(--accent-color-primary);
    }
  }

  & > li:first-child {
    border-bottom-left-radius: 10px;
    border-top-left-radius: 10px;
  }

  & > li:last-child {
    border-bottom-right-radius: 10px;
    border-top-right-radius: 10px;
  }

  & > li:not(:first-child) {
    border-left: 1px solid var(--opacity-bg-element-2);
  }
}
</style>
