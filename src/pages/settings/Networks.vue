<template>
  <div :class="b()">
    <TopBar/>
    <P
      :class="b('reset', 'pointer')"
      @click="onDefaultConfig"
    >
      {{ local.RESET }}
    </P>
    <div :class="b('wrapper')">
      <RadioGroup
        :value="network"
        :title="local.NETWORKS"
        :elements="networkConfig | keys"
        @input="onChangeNetwork"
      >
        {{ local.NETWORKS }}:
      </RadioGroup>
      <div v-show="network !== MAINNET">
        <Input
          v-model="http.model"
          :error="http.error"
          :disabled="MAINNET === this.network || TESTNET === this.network"
          title="RPC endpoint:"
          round
          second
          @input="http.error = null"
        />
        <Input
          v-model="ws.model"
          :error="ws.error"
          :disabled="MAINNET === this.network || TESTNET === this.network"
          title="Websocket endpoint:"
          round
          second
          @input="ws.error = null"
        />
        <Input
          v-model="msg.model"
          :error="msg.error"
          :type="INPUT_TYPES.number"
          :disabled="MAINNET === this.network || TESTNET === this.network"
          title="Msg version:"
          round
          second
          @input="msg.error = null"
        />
        <Button
          v-show="MAINNET !== this.network && TESTNET !== this.network"
          :class="b('btn')"
          :color="COLOR_VARIANTS.negative"
          :size="SIZE_VARIANS.sm"
          :name="buttons.change"
          :value="buttons.change"
          round
          block
          @click="onChangeConfig"
        >
          {{ local.UPDATE }}
        </Button>
      </div>
      <div
        v-show="network === MAINNET"
        :class="b('nodes')"
      >
        <RadioGroup
          :value="network"
          :title="local.SSN_LIST"
          :elements="ssnItems"
          @input="onChangeNetwork"
        >
          {{ local.SSN_LIST }}:
        </RadioGroup>
      </div>
    </div>
  </div>
</template>

<script>
import { ZILLIQA } from 'config/zilliqa'
import { TypeChecker } from 'lib/type'

import { v4 as uuid } from 'uuid'
import { mapState, mapMutations, mapActions } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'

import { COLOR_VARIANTS, REGX_PATTERNS, SIZE_VARIANS } from '@/config'

import TopBar from '@/components/TopBar'
import RadioGroup from '@/components/RadioGroup'
import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'
import P from '@/components/P'

import { keys } from '@/filters'

const MAINNET = Object.keys(ZILLIQA)[0]
const TESTNET = Object.keys(ZILLIQA)[1]

export default {
  name: 'Networks',
  components: {
    TopBar,
    RadioGroup,
    Input,
    P,
    Button
  },
  filters: { keys },
  data() {
    return {
      COLOR_VARIANTS,
      INPUT_TYPES,
      SIZE_VARIANS,
      MAINNET,
      TESTNET,

      http: {
        model: ZILLIQA[MAINNET].PROVIDER,
        error: null
      },
      ws: {
        model: ZILLIQA[MAINNET].WS,
        error: null
      },
      msg: {
        model: ZILLIQA[MAINNET].MSG_VERSION,
        error: null
      },
      buttons: {
        change: uuid(),
        default: uuid()
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.networkConfig,
      settingsStore.STATE_NAMES.network,
      settingsStore.STATE_NAMES.ssnList
    ]),

    ssnItems() {
      return this.ssnList.map((ssn) => `${ssn.name} ${ssn.time} ms`)
    }
  },
  methods: {
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.onUpdateSelectedNet
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
    ...mapActions(walletStore.STORE_NAME, [
      walletStore.ACTIONS_NAMES.checkProvider
    ]),
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.onUpdateNetworkConfig,
      settingsStore.ACTIONS_NAMES.onUpdateSSnList
    ]),

    onUpdateModels() {
      const currentConfig = this.networkConfig[this.network]

      if (!currentConfig.PROVIDER) {
        currentConfig.PROVIDER = ZILLIQA[this.network].PROVIDER
      }
      if (!currentConfig.WS) {
        currentConfig.WS = ZILLIQA[this.network].WS
      }
      if (!currentConfig.MSG_VERSION || isNaN(currentConfig.MSG_VERSION)) {
        currentConfig.MSG_VERSION = ZILLIQA[this.network].MSG_VERSION
      }

      this.http.model = currentConfig.PROVIDER
      this.ws.model = currentConfig.WS
      this.msg.model = currentConfig.MSG_VERSION
    },

    async onChangeNetwork(net) {
      this.setLoad()

      this.msg.error = null
      this.http.error = null
      this.ws.error = null

      await this.onUpdateSelectedNet(net)
      this.onUpdateModels()
      this.setLoad()
    },
    async onChangeConfig() {
      const regExp = new RegExp(REGX_PATTERNS.url, 'i')
      const httpTest = regExp.test(this.http.model)
      const wsTest = regExp.test(this.ws.model)
      const msgTest = new TypeChecker(Number(this.msg.model)).isInt

      if (!httpTest) {
        this.http.error = this.local.HTTP_ERROR
      }
      if (!wsTest) {
        this.ws.error = this.local.WS_ERROR
      }
      if (!msgTest) {
        this.msg.error = this.local.MSG_ERROR
      }
      if (this.http.error || this.ws.error || this.msg.error) {
        return null
      }

      const currentConfig = this.networkConfig

      currentConfig[this.network].PROVIDER = this.http.model
      currentConfig[this.network].WS = this.ws.model
      currentConfig[this.network].MSG_VERSION = this.msg.model

      this.setLoad()

      try {
        await this.onUpdateNetworkConfig(currentConfig)
        await this.checkProvider(this.http.model)
      } catch (err) {
        //
      } finally {
        this.onUpdateModels()
        this.setLoad()
      }
    },
    async onDefaultConfig() {
      try {
        await this.onChangeNetwork(MAINNET)
        this.setLoad()
        await this.onUpdateNetworkConfig(ZILLIQA)
        await this.onUpdateSSnList()
      } catch (err) {
        //
      } finally {
        this.onUpdateModels()
        this.setLoad()
      }
    }
  },
  mounted() {
    this.onUpdateModels()
  }
}
</script>

<style lang="scss">
.Networks {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__nodes {
    margin-top: 15px;
  }

  &__reset {
    position: absolute;
    right: 20px;
    top: 20px;
    text-decoration: underline;
  }

  &__wrapper {
    margin-top: 30px;
    min-width: 250px;

    & > .Input {
      padding: 25px;
    }
  }

  &__btn {
    min-width: 250px;
    margin-top: 10px;
  }
}
</style>
