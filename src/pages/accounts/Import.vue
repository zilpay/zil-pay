<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <RadioGroup
        v-model="radioGroup.model"
        :elements="radioGroup.elements"
      />
    </Container>
    <Alert v-show="radioGroup.model === RADIO_ELEMENTS[0]">
      <Container :class="b('info')">
        <P
          :class="b('info-title')"
          capitalize
        >
          {{ local.IMPORT }} {{ local.PRIVATEKEY }}
        </P>
        <Input
          v-model="privateKey.model"
          :placeholder="RADIO_ELEMENTS[0]"
          :error="privateKey.error"
          round
          autofocus
          @input="privateKey.error = null"
        />
      </Container>
    </Alert>
    <Alert v-show="radioGroup.model === RADIO_ELEMENTS[1]">
      <Container :class="b('info')">
        <P
          :class="b('info-title')"
          capitalize
        >
          {{ local.IMPORT_KEYSTORE }}
        </P>
        <Input
          v-model="jsonFile.password"
          :placeholder="local.PASSWORD"
          :error="jsonFile.error"
          :type="INPUT_TYPES.password"
          round
        />
        <input
          :class="b('json')"
          ref="json"
          type="file"
          accept="application/JSON"
        >
      </Container>
    </Alert>
    <Alert v-show="radioGroup.model === RADIO_ELEMENTS[2]">
      <Container :class="b('info')">
        <P
          :class="b('info-title')"
          capitalize
        >
          {{ local.IMPORT_HW }}
        </P>
        <Input
          v-model="ledger.index"
          :error="ledger.error"
          :placeholder="local.WALLET_ID"
          :type="INPUT_TYPES.number"
          round
          @input="ledger.error = null"
        />
      </Container>
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
import { mapState, mapActions, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'
import accountsStore from '@/store/accounts'

import { SIZE_VARIANS } from '@/config'

import homePage from '@/pages/Home'

import Alert from '@/components/Alert'
import P from '@/components/P'
import Input, { INPUT_TYPES } from '@/components/Input'
import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import RadioGroup from '@/components/RadioGroup'
import Button from '@/components/Button'

import { Background, walletUpdate, ledgerImportAccount } from '@/services'
import { UNIQUE } from 'lib/errors/annotations'

const { FileReader } = global
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
        index: 0,
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
    ...mapActions(walletStore.STORE_NAME, [
      walletStore.ACTIONS_NAMES.onLedgerAccount
    ]),
    ...mapActions(accountsStore.STORE_NAME, [
      accountsStore.ACTIONS_NAMES.onAddAccount
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
    ...mapMutations(accountsStore.STORE_NAME, [
      accountsStore.MUTATIONS_NAMES.setAccount,
      accountsStore.MUTATIONS_NAMES.setAccounts,
      accountsStore.MUTATIONS_NAMES.setWallet
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
    async onPrivateKey() {
      const bg = new Background()

      try {
        this.setLoad()

        const result = await bg.importPrivKey(this.privateKey.model)

        this.setAccounts(result.identities)
        this.setAccount(result.selectedAddress)

        walletUpdate(result)

        this.$router.push({ name: homePage.name })
      } catch (err) {
        if (err.message.includes(UNIQUE)) {
          this.privateKey.error = this.local.UNIQUE_IMPORT_ERR
        } else {
          this.privateKey.error = this.local.INVALID_PRIVATEKEY
        }
      } finally {
        this.setLoad()
      }
    },
    /**
     * When import type is keystore file.
     */
    onJsonFile() {
      const file = this.$refs.json.files[0]
      const reader = new FileReader()
      const path = this.$refs.json.files[0].name

      reader.onload = async(e) => {
        const bg = new Background()

        try {
          this.setLoad()

          const wallet = await bg.importKeystore({
            name: path.split('.')[0],
            content: e.target.result,
            password: this.jsonFile.password
          })

          this.setWallet(wallet)

          this.$router.push({ name: homePage.name })
        } catch (err) {
          if (err.message.includes(UNIQUE)) {
            this.jsonFile.error = this.local.UNIQUE_IMPORT_ERR
          } else {
            this.jsonFile.error = this.local.INCORRECT_KEYSTORE
          }
        } finally {
          this.setLoad()
        }
      }

      reader.readAsText(file)
    },
    /**
     * When import type is ledger hardware wallet.
     */
    async onLedger() {
      this.setLoad()
      try {
        const result = await ledgerImportAccount(this.ledger.index)

        await this.onAddAccount(result)

        this.$router.push({ name: homePage.name })
      } catch (err) {
        this.ledger.error = err
        // Denied or any errors.
      } finally {
        this.setLoad()
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

    padding-top: 15px;
    padding-bottom: 15px;
  }

  &__info-title {
    margin-bottom: 15px;
  }

  &__btn {
    margin-top: 15px;
    margin-left: 15px;
    min-width: 100px;
  }

  &__json {
    margin-top: 15px;
  }
}
</style>
