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
import { mapState, mapGetters, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import accountsStore from '@/store/accounts'

import {
  COLOR_VARIANTS,
  SIZE_VARIANS,
  FONT_VARIANTS,
  ICON_VARIANTS,
  ICON_TYPE
} from '@/config'

import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'
import P from '@/components/P'
import Icon from '@/components/Icon'

import { Background } from '@/services'

const { Promise } = global
const SYNC_EVENTS = {
  start: 'start-sync',
  connectionInfo: 'connection-info',
  endSync: 'end-sync',
  syncingData: 'syncing-data'
}

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
      pubnubListener: null,
      syncing: false,
      completed: false
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
      if (this.syncing) {
        return null
      }

      this.syncing = true

      const allDataStr = JSON.stringify({
        seed: 'sdasdasds',
        importedAccounts: 'importedAccounts',
        accounts: []
      })

      const chunks = this.chunkString(allDataStr, 17000)
      const totalChunks = chunks.length
      try {
        for (let i = 0; i < totalChunks; i++) {
          await this.sendMessage(chunks[i], i + 1, totalChunks)
        }
      } catch (e) {
        // this.props.displayWarning('Sync failed :(')
        this.syncing = false
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
      this.channelName = `mm-${PubNub.generateUUID()}`

      QRCode.toDataURL(
        `zilpay-sync:${this.channelName}|@|${this.cipherKey}`
      ).then((base64) => this.qrcode = base64)
    },
    initWebsockets() {
      // Make sure there are no existing listeners
      this.disconnectWebsockets()

      this.pubnub = new PubNub({
        subscribeKey: 'pub-c-59f9788d-7754-46e8-b653-71566255aac1',
        publishKey: 'sub-c-2b8cbe56-766b-11eb-b2c3-2e58680e8335',
        cipherKey: this.cipherKey,
        ssl: true,
      })

      this.pubnubListener = {
        message: ({ channel, message }) => {
          // handle message
          if (channel !== this.channelName || !message) {
            return
          }

          console.log(message.event)

          switch (message.event) {
          case SYNC_EVENTS.start:
            this.startSyncing()
            break
          case SYNC_EVENTS.connectionInfo:
            this.disconnectWebsockets()
            this.initWithCipherKeyAndChannelName(message.cipher, message.channel)
            this.initWebsockets()
            break
          case SYNC_EVENTS.endSync:
            this.disconnectWebsockets()
            this.syncing = false
            this.completed = true
            break
          default:
            break
          }
        }
      }
      this.pubnub.addListener(this.pubnubListener)
      this.pubnub.subscribe({
        channels: [this.channelName],
        withPresence: false,
      })
    },
    disconnectWebsockets() {
      if (this.pubnub && this.pubnubListener) {
        this.pubnub.removeListener(this.pubnubListener)
      }
    },
    sendMessage(data, pkg, count) {
      return new Promise((resolve, reject) => {
        this.pubnub.publish(
          {
            message: {
              event: SYNC_EVENTS.syncingData,
              data,
              totalPkg: count,
              currentPkg: pkg,
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
    chunkString(str, size) {
      const numChunks = Math.ceil(str.length / size)
      const chunks = new Array(numChunks)
      let o = 0
      for (let i = 0; i < numChunks; i += 1) {
        chunks[i] = str.substr(o, size)
        o += size
      }
      return chunks
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
