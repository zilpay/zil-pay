<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <RadioGroup
        v-model="radioGroup.model"
        :elements="radioGroup.elements"
      />
    </Container>
    <Alert
      v-show="radioGroup.model === RADIO_ELEMENTS[0]"
      :class="b('info')"
    >
      <P>
        {{ local.IMPORT_PRIVATE_KEY }}
      </P>
      <Input
        v-model="privateKey.model"
        :placeholder="RADIO_ELEMENTS[0]"
        :error="privateKey.error"
        round
        @input="privateKey.error = null"
      />
    </Alert>
    <Alert
      v-show="radioGroup.model === RADIO_ELEMENTS[1]"
      :class="b('info')"
    >
      <P>
        {{ local.IMPORT_KEYSTORE }}
      </P>
      <Input
        v-model="jsonFile.password"
        :placeholder="local.PASSWORD"
        :error="jsonFile.error"
        round
      />
      <input
        ref="json"
        type="file"
        accept="application/JSON"
      >
    </Alert>
    <Alert
      v-show="radioGroup.model === RADIO_ELEMENTS[2]"
      :class="b('info')"
    >
      <P>
        {{ local.IMPORT_HW }}
      </P>
      <Input
        v-model="ledger.index"
        :placeholder="local.WALLET_ID"
        :type="INPUT_TYPES.number"
        round
      />
    </Alert>
    <Button
      :class="b('btn')"
      round
      @click="onEvent"
    >
      {{ local.IMPORT }}
    </Button>
  </div>
</template>

<script>
import { isPrivateKey } from '@zilliqa-js/util/dist/validation'

import { mapState, mapActions } from 'vuex'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'

import { SIZE_VARIANS } from '@/config'
import { LedgerControll } from '@/utils'

import Alert from '@/components/Alert'
import P from '@/components/P'
import Input, { INPUT_TYPES } from '@/components/Input'
import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import RadioGroup from '@/components/RadioGroup'
import Button from '@/components/Button'

const { FileReader } = global
const ledgerControll = new LedgerControll()
const RADIO_ELEMENTS = [
  'PrivateKey',
  'JSON',
  'Ledger'
]

export default {
  name: 'Import',
  components: {
    TopBar,
    Container,
    RadioGroup,
    Alert,
    P,
    Input,
    Button
  },
  data() {
    return {
      SIZE_VARIANS,
      RADIO_ELEMENTS,
      INPUT_TYPES,

      radioGroup: {
        elements: RADIO_ELEMENTS,
        model: RADIO_ELEMENTS[0]
      },
      jsonFile: {
        error: null,
        password: null
      },
      privateKey: {
        model: null,
        error: null
      },
      ledger: {
        index: 0
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
  },
  methods: {
    ...mapActions(walletStore.STORE_NAME, [
      walletStore.ACTIONS_NAMES.onLedgerAccount,
      walletStore.ACTIONS_NAMES.onKeyStore
    ]),

    /**
     * Listing all events for import type/
     */
    onEvent() {
      switch (this.radioGroup.model) {
      case this.radioGroup.elements[0]:
        this.onPrivateKey()
        break
      case this.radioGroup.elements[1]:
        this.onJsonFile()
        break
      case this.radioGroup.elements[2]:
        this.onLedger()
        break
      default:
        break
      }
    },
    /**
     * When import type is PrivateKey.
     */
    onPrivateKey() {
      try {
        isPrivateKey(this.privateKey)
      } catch (err) {
        this.privateKey.error = this.local.INVALID_PRIVATEKEY
      }
    },
    /**
     * When import type is keystore file.
     */
    onJsonFile() {
      const file = this.$refs.json.files[0]
      const reader = new FileReader()
      const path = this.$refs.json.files[0].name

      reader.onload = e => {
        this.onKeyStore({
          name: path.split('.')[0],
          content: e.target.result,
          password: this.jsonFile.password
        })
      }

      reader.readAsText(file)
    },
    /**
     * When import type is ledger hardware wallet.
     */
    async onLedger() {
      try {
        let { pubAddr, publicKey } = await ledgerControll.getAddresses(
          this.ledger.index
        )

        this.onLedgerAccount({
          pubAddr,
          publicKey,
          hwIndex: this.ledger.index
        })
      } catch (err) {
        //
      }
    }
  }
}
</script>

<style lang="scss">
.Import {
  &__wrapper {
    display: grid;
    grid-gap: 30px;
    justify-items: center;

    /* top | right | bottom | left */
    padding: 15px 15px 40px 15px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    line-height: 20px;
    font-size: 15px;

    height: 150px;
  }

  &__btn {
    margin-left: 15px;
    min-width: 100px;
  }
}
</style>
