<template>
  <div :class="b()">
    <form @submit.prevent="onEvent">
      <Input
        v-show="!content"
        v-model="password.model"
        :placeholder="local.PASSWORD"
        :type="INPUT_TYPES.password"
        :error="password.error"
        round
        required
        autofocus
        @input="password.error = null"
      />
      <Button
        v-show="!content"
        :color="COLOR_VARIANTS.negative"
        round
        uppercase
      >
        {{ local.REVEAL }}
      </Button>
    </form>
    <div
      v-show="content"
      :class="b('warn')"
    >
      <Icon
        :icon="ICON_VARIANTS.warn"
        width="25"
        height="25"
      />
      <P>
        {{ local.EXPORT_DANGER }}
      </P>
    </div>
    <Icon
      v-if="qrcode"
      :icon="qrcode"
      :type="ICON_TYPE.auto"
      height="200"
      width="200"
    />
    <P
      v-show="qrcode"
      :variant="COLOR_VARIANTS.primary"
    >
      {{ local.SCAN_MOBILE_CONNECT }}
    </P>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import PubNub from 'pubnub'
import { FIELDS } from 'config'
import { BrowserStorage } from 'lib/storage'
import { mapState, mapGetters, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import accountsStore from '@/store/accounts'

import {
  COLOR_VARIANTS,
  SIZE_VARIANS,
  FONT_VARIANTS,
  ICON_VARIANTS,
  ICON_TYPE,
  EVENTS
} from '@/config'

import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'
import P from '@/components/P'
import Icon from '@/components/Icon'

import { Background } from '@/services'

const { Promise } = global
const SYNC_EVENTS = {
  start: 'start-sync',
  endSync: 'end-sync',
  syncingData: 'syncing-data'
}
const PUB_KEY = 'pub-c-59f9788d-7754-46e8-b653-71566255aac1'
const SUB_KEY = 'sub-c-2b8cbe56-766b-11eb-b2c3-2e58680e8335'

export default {
  name: 'WalletConnectModal',
  components: {
    Input,
    Icon,
    P,
    Button
  },
  props: {
    modalType: {
      type: [Number, String]
    }
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      FONT_VARIANTS,
      INPUT_TYPES,
      ICON_VARIANTS,
      ICON_TYPE,

      content: null,
      password: {
        model: null,
        error: null
      },
      qrcode: null,
      cipherKey: null,
      channelName: null,
      pubnub: null,
      pubnubListener: null
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ])
  },
  methods: {
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),

    async onEvent() {
      this.setLoad()
      await this.onGenerate()
      this.setLoad()
    },
    async onGenerate() {
      const bg = new Background()
      try {
        this.content = await bg.exportSeed(this.password.model)
        this.startKeysGeneration()
      } catch (err) {
        this.password.error = `${this.local.INCORRECT} ${this.local.PASSWORD}`
      }
    },
    async startSyncing() {
      const storage = new BrowserStorage()
      const data = await storage.get([
        FIELDS.VAULT,
        FIELDS.VAULT_IMPORTED,
        FIELDS.WALLET
      ])

      const allDataStr = JSON.stringify({
        seed: data.vault,
        importedAccounts: data.importedvault,
        wallet: data.wallet
      })

      try {
        await this.sendMessage(allDataStr)
      } catch (e) {
        this.syncError = e.toString()
      }
    },
    startKeysGeneration() {
      this.disconnectWebsockets()
      this.generateCipherKeyAndChannelName()
      this.initWebsockets()
    },
    generateCipherKeyAndChannelName() {
      const { address } = this.getCurrentAccount

      this.cipherKey = `${address.substr(-4,)}-${PubNub.generateUUID()}`
      this.channelName = PubNub.generateUUID()

      QRCode.toDataURL(
        `zilpay-sync:${this.channelName}|@|${this.cipherKey}`
      ).then((base64) => this.qrcode = base64)
    },
    initWebsockets() {
      this.pubnub = new PubNub({
        cipherKey: this.cipherKey,
        publishKey: PUB_KEY,
        subscribeKey: SUB_KEY,
        ssl: true
      })

      this.pubnubListener = {
        message: ({ channel, message }) => {
          // handle message
          if (channel !== this.channelName || !message) {
            return
          }

          switch (message.event) {
          case SYNC_EVENTS.start:
            this.startSyncing()
            break
          case SYNC_EVENTS.endSync:
            this.disconnectWebsockets()
            this.$emit(EVENTS.close)
            break
          default:
            break
          }
        }
      }
      this.pubnub.addListener(this.pubnubListener)
      this.pubnub.subscribe({
        channels: [this.channelName],
        withPresence: false
      })
    },
    disconnectWebsockets() {
      if (this.pubnub) {
        this.pubnub.removeAllListeners()
        this.pubnub.stop()
        this.pubnub.unsubscribeAll()
      }
    },
    sendMessage(data) {
      return new Promise((resolve, reject) => {
        this.pubnub.publish(
          {
            message: {
              event: SYNC_EVENTS.syncingData,
              data
            },
            channel: this.channelName,
            sendByPost: false, // true to send via post
            storeInHistory: false
          },
          (status, response) => {
            if (status.error) {
              reject(response)
            } else {
              resolve()
            }
          },
        )
      })
    },
    initWithCipherKeyAndChannelName(cipherKey, channelName) {
      this.cipherKey = cipherKey
      this.channelName = channelName
    }
  },
  destroyed() {
    this.disconnectWebsockets()
  }
}
</script>

<style lang="scss">
.WalletConnectModal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  padding-bottom: 20px;
  padding-top: 20px;

  min-height: 100px;

  &__warn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
  }

  & > .P {
    margin-top: 15px;
  }

  & > form {
    display: flex;
    align-items: center;
    flex-direction: column;

    & > .Input {
      width: 250px;
    }

    & > button {
      margin: 15px;
      width: 100px;
      height: 40px;
    }
  }
}
</style>
