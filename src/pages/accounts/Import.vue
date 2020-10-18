<template>
  <div :class="b()">
    <TopBar close/>
    <div :class="b('wrapper')">
      <RadioGroup
        v-model="radioGroup.model"
        :elements="radioGroup.elements"
      />
      <ul>
        <li v-show="radioGroup.model === RADIO_ELEMENTS[0]">
          <P>
            {{ local.ENTER_PRIVATEKEY }}:
          </P>
          <Input
            v-model="privateKey.model"
            :placeholder="RADIO_ELEMENTS[0]"
            :error="privateKey.error"
            round
            autofocus
            @input="privateKey.error = null"
          />
        </li>
        <li v-show="radioGroup.model === RADIO_ELEMENTS[1]">
          <P>
            {{ local.IMPORT_KEYSTORE }}:
          </P>
          <input
            :class="b('json')"
            ref="json"
            type="file"
            accept="application/JSON"
          >
          <Input
            v-model="jsonFile.password"
            :placeholder="local.PASSWORD"
            :error="jsonFile.error"
            :type="INPUT_TYPES.password"
            round
          />
        </li>
        <li v-show="radioGroup.model === RADIO_ELEMENTS[2]">
            <P>
              {{ local.IMPORT_HW }}:
            </P>
            <Input
              v-model="ledger.index"
              :error="ledger.error"
              :placeholder="local.WALLET_ID"
              :type="INPUT_TYPES.number"
              round
              @input="ledger.error = null"
            />
        </li>
      </ul>
      <Tabs
        :elements="tabElements"
        @input="onEvent"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'
import accountsStore from '@/store/accounts'

import { SIZE_VARIANS, COLOR_VARIANTS, FONT_VARIANTS } from '@/config'

import homePage from '@/pages/Home'

import P from '@/components/P'
import Input, { INPUT_TYPES } from '@/components/Input'
import TopBar from '@/components/TopBar'
import RadioGroup from '@/components/RadioGroup'
import Tabs from '@/components/Tabs'

import { Background, ledgerImportAccount, walletUpdate } from '@/services'
import { UNIQUE } from 'lib/errors/annotations'

const { FileReader } = global
const RADIO_ELEMENTS = [
  'Private key',
  'Key store',
  'Ledger'
]

export default {
  name: 'Import',
  components: {
    TopBar,
    RadioGroup,
    P,
    Input,
    Tabs
  },
  data() {
    return {
      SIZE_VARIANS,
      RADIO_ELEMENTS,
      INPUT_TYPES,
      COLOR_VARIANTS,
      FONT_VARIANTS,

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
    ]),

    tabElements() {
      return [
        {
          name: this.local.CANCEL
        },
        {
          name: this.local.IMPORT
        }
      ]
    }
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
    onEvent(event) {
      if (event === 0) {
        this.$router.push({ name: homePage.name })

        return null
      }

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

        await walletUpdate(result)

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

          await walletUpdate(wallet)

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
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    width: 90%;
    min-height: 340px;

    & > ul {
      padding: 0;
      list-style: none;

      & > li {
        min-width: 290px;

        & > .P {
          margin-bottom: 10px;
        }

        & > input[type="file"] {
          margin-bottom: 10px;
        }
      }
    }

    & > .Button {
      min-width: 250px;
    }
  }
}
</style>
