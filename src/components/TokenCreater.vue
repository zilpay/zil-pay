<template>
  <form
    :class="b()"
    @submit.prevent="onSave"
  >
    <Input
      v-model="contract.model"
      :title="local.TOKEN_CONTRACT"
      :error="contract.error"
      placeholder="zil1whrkchln60sxedk04jw09x92vss5hvyjmrvlz6"
      round
      @input="onFindToken"
    />
    <ul :class="b('details')">
      <li
        v-for="(el, index) of this.payload"
        :key="index"
      >
        <P>
          {{ el.title }}
        </P>
        <P>
          {{ el.value }}
        </P>
      </li>
    </ul>
    <Button
      v-show="payload && payload.length > 0"
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

import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import settingsStore from '@/store/settings'

import { COLOR_VARIANTS } from '@/config'

import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'
import P from '@/components/P'

import { Background } from '@/services'
import { toAddress } from '@/filters'

export default {
  name: 'TokenCreater',
  filters: { toAddress },
  components: {
    Input,
    P,
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
      payload: []
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
    ])
  },
  methods: {
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),

    async onFindToken() {
      if (!this.contract.model || !isBech32(this.contract.model)) {
        this.contract.error = `*${this.local.INCORRECT_ADDR_FORMAT}`

        return null
      }

      const bg = new Background()

      this.setLoad()

      try {
        const result = await bg.getTokenInfo(this.contract.model)

        this.payload = [
          {
            title: this.local.TOKEN_SYMBOL,
            value: result.symbol
          },
          {
            title: this.local.TOKEN_NAME,
            value: result.name
          },
          {
            title: this.local.TOKEN_OWNER,
            value: toAddress(result.init_owner, this.addressFormat)
          },
          {
            title: this.local.TOKEN_DECIMALS,
            value: result.decimals
          },
          {
            title: this.local.TOKEN_PROXY,
            value: toAddress(result.proxy_address, this.addressFormat)
          },
          {
            title: this.local.EPOCH,
            value: result._creation_block
          }
        ]
      } catch (err) {
        this.contract.error = err.message
      }

      this.setLoad()
    },
    async onSave() {
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

  &__details {
    padding: 0;
    list-style: none;

    & > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  & > .Input {
    width: 90%;
  }

  & > .Button {
    max-width: 200px;
  }
}
</style>
