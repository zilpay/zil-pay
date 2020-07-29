<template>
  <ul :class="b()">
    <li
      v-for="(el, index) of items"
      :key="index"
      :class="b('i', { selected: el.selected })"
      @click="onGaschanged(index)"
    >
      <P>
        {{ el.name }}
      </P>
      <P>
        {{ el.value | fromZil(DEFAULT_TOKEN.decimals) | toLocaleString }} {{ DEFAULT_TOKEN.symbol }}
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

import { fromZil, toLocaleString } from '@/filters'
import CalcMixin, { gasFee } from '@/mixins/calc'

export default {
  name: 'GasSelecter',
  filters: { fromZil, toLocaleString },
  mixins: [CalcMixin],
  components: {
    P
  },
  props: {
    value: {
      type: Object,
      required: true
    },
    defaultValue: {
      type: String,
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
      const defaultValue = JSON.parse(this.defaultValue)

      if (!this.value) {
        return []
      }
      if (!defaultValue || !defaultValue.gasLimit || !defaultValue.gasPrice) {
        return []
      }

      const { gasPrice } = this.value
      const { _fee } = gasFee(String(defaultValue.gasPrice), String(defaultValue.gasLimit))

      return [
        {
          name: this.local.SLOW,
          value: _fee,
          selected: Number(gasPrice) === Number(defaultValue.gasPrice)
        },
        {
          name: this.local.AVERAGE,
          value: _fee.mul(2),
          selected: Number(gasPrice) === (Number(defaultValue.gasPrice) * 2)
        },
        {
          name: this.local.FAST,
          value: _fee.mul(3),
          selected: Number(gasPrice) >= (Number(defaultValue.gasPrice) * 3)
        }
      ]
    }
  },
  methods: {
    onGaschanged(index) {
      const defaultValue = JSON.parse(this.defaultValue)
      const { gasLimit, gasPrice } = defaultValue

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
