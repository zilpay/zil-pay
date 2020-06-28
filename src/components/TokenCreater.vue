<template>
  <form
    :class="b()"
    @submit.prevent="onSave"
  >
    <Input
      v-model="contract.model"
      :title="local.TOKEN_CONTRACT"
      :error="contract.error"
      placeholder="zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace"
      round
    />
    <Input
      v-model="symbol.model"
      :title="local.TOKEN_SYMBOL"
      :error="symbol.error"
      placeholder="ZWT"
      round
    />
    <Input
      v-model="decimals.model"
      :title="local.TOKEN_DECIMALS"
      :error="decimals.error"
      :type="INPUT_TYPES.number"
      placeholder="18"
      round
    />
    <Button
      :color="COLOR_VARIANTS.negative"
      block
      round
    >
      {{ local.SAVE_TOKEN }}
    </Button>
  </form>
</template>

<script>
import { isBech32 } from '@zilliqa-js/util/dist/validation'

import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import { COLOR_VARIANTS } from '@/config'

import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'

export default {
  name: 'TokenCreater',
  components: {
    Input,
    Button
  },
  data() {
    return {
      COLOR_VARIANTS,
      INPUT_TYPES,

      contract: {
        model: null,
        error: null
      },
      symbol: {
        model: null,
        error: null
      },
      decimals: {
        model: null,
        error: null
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
  },
  methods: {
    onSave() {
      if (!this.contract.model || !isBech32(this.contract.model)) {
        this.contract.error = `*${this.local.INCORRECT_ADDR_FORMAT}`

        return null
      }
    }
  }
}
</script>

<style lang="scss">
.TokenCreater {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  min-height: 250px;
  padding: 10px;

  & > .Input {
    width: 90%;
  }

  & > .Button {
    max-width: 200px;
  }
}
</style>
