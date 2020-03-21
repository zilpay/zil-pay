<template>
  <div :class="b()">
    <TopBar />
    <Alert :class="b('recipient')">
      <Title :size="SIZE_VARIANS.sm">
        {{ local.ADD }} {{ local.RECIPIENT }}
      </Title>
      <Input
        v-model="recipientAddress.model"
        :placeholder="placeholder"
        :error="recipientAddress.error"
        round
        autofocus
        @input="fromZNS"
      />
    </Alert>
    <Container v-for="(action, index) of transferTo" :key="index">
      <Item
        pointer
        @click="onEvent(action.event)"
      >
        <Title
          :class="b('item-action')"
          :variant="COLOR_VARIANTS.info"
          :font="FONT_VARIANTS.light"
        >
          {{ action.name }}
        </Title>
      </Item>
      <Separator v-show="index < transferTo.length - 1"/>
    </Container>
    <Container :class="b('amount-form')">
      <div :class="b('amount-zil')">
        <Title :size="SIZE_VARIANS.xs">
          {{ local.AMOUNT + ' ZIL.' }}
        </Title>
        <Input
          v-model="amount.model"
          :type="INPUT_TYPES.number"
          :error="amount.error"
          pattern="[0-9]*"
          required
          round
          @input="amount.error = null"
        />
      </div>
      <Button
        :color="COLOR_VARIANTS.warning"
        round
        block
        @click="toMaxAmount"
      >
        MAX
      </Button>
    </Container>
    <BottomBar
      :elements="bottomBar"
      @click="onEvent"
    />
    <BottomModal v-model="accountModal">
      <Container
        v-for="(acc, index) of identities"
        :key="index"
        @click="onAddress(acc.address)"
      >
        <Item pointer arrow>
          <Title
            :font="FONT_VARIANTS.light"
            :size="SIZE_VARIANS.sm"
          >
            {{ getAccountName(acc) }}
          </Title>
        </Item>
        <Separator v-show="index < identities.length - 1"/>
      </Container>
    </BottomModal>
    <BottomModal v-model="contactModal">
      <Container
        v-for="(acc, index) of contactList"
        :key="index"
        @click="onAddress(acc.address)"
      >
        <Item pointer arrow>
          <Title
            :font="FONT_VARIANTS.light"
            :size="SIZE_VARIANS.sm"
          >
            {{ acc.name }}
          </Title>
        </Item>
        <Separator v-show="index < contactList.length - 1"/>
      </Container>
    </BottomModal>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import { isBech32 } from '@zilliqa-js/util/dist/validation'
import { units } from '@zilliqa-js/util'

import { mapState, mapGetters, mapMutations } from 'vuex'
import accountsStore from '@/store/accounts'
import contactsStore from '@/store/contacts'
import uiStore from '@/store/ui'
import settingsStore from '@/store/settings'
import transactionsStore from '@/store/transactions'

import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  FONT_VARIANTS,
  ADDRESS_FORMAT_VARIANTS,
  REGX_PATTERNS
} from '@/config'

import HomePage from '@/pages/Home'
import PopupPage from '@/pages/Popup'

import TopBar from '@/components/TopBar'
import BottomBar from '@/components/BottomBar'
import Alert from '@/components/Alert'
import Title from '@/components/Title'
import Button from '@/components/Button'
import Input, { INPUT_TYPES } from '@/components/Input'
import Item from '@/components/Item'
import Container from '@/components/Container'
import Separator from '@/components/Separator'
import BottomModal from '@/components/BottomModal'

import CalcMixin from '@/mixins/calc'
import AccountMixin from '@/mixins/account'
import { toAddress, toZIL } from '@/filters'
import { Background } from '@/services'

const EVENTS = {
  send: uuid(),
  cancel: uuid(),
  accounts: uuid(),
  contacts: uuid()
}
export default {
  name: 'Send',
  mixins: [CalcMixin, AccountMixin],
  components: {
    TopBar,
    BottomBar,
    BottomModal,
    Alert,
    Title,
    Input,
    Item,
    Separator,
    Button,
    Container
  },
  filters: { toAddress },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      FONT_VARIANTS,
      INPUT_TYPES,

      amount: {
        model: 0,
        error: null
      },
      recipientAddress: {
        model: null,
        error: null
      },
      defaultGasFee: '',
      accountModal: false,
      contactModal: false
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.defaultGas
    ]),
    ...mapState(accountsStore.STORE_NAME, [
      accountsStore.STATE_NAMES.identities,
      accountsStore.STATE_NAMES.selectedAddress
    ]),
    ...mapState(contactsStore.STORE_NAME, [
      contactsStore.STATE_NAMES.contactList
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ]),

    placeholder() {
      return `${this.local.SELECT} ${this.local.PUBLIC} ${this.local.ADDRESS} (zil1), ${this.local.OR} ZNS`
    },
    transferTo() {
      return [
        {
          name: `${this.local.TRANSFER} ${this.local.BETWEEN} ${this.local.MY} ${this.local.ACCOUNTS}`,
          event: EVENTS.accounts
        },
        {
          name: `${this.local.TRANSFER} ${this.local.BETWEEN} ${this.local.MY} ${this.local.CONTACTS}`,
          event: EVENTS.contacts
        }
      ]
    },
    bottomBar() {
      return [
        {
          value: this.local.CANCEL,
          event: EVENTS.cancel,
          size: SIZE_VARIANS.sm,
          variant: COLOR_VARIANTS.primary,
          uuid: uuid()
        },
        {
          value: this.local.NEXT,
          event: EVENTS.send,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm,
          uuid: uuid()
        }
      ]
    },
    /**
     * Testing for address format.
     */
    testAddress() {
      try {
        return isBech32(this.recipientAddress.model)
      } catch (err) {
        return false
      }
    },
    /**
     * Testing for insufficient funds.
     */
    testAmount() {
      const { gasLimit, gasPrice } = this.defaultGas
      const amount = toZIL(this.amount.model)

      return this.calcIsInsufficientFunds(
        amount,
        gasLimit,
        gasPrice,
        this.getCurrentAccount.balance
      )
    }
  },
  methods: {
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setConfirmationTx
    ]),

    onEvent(event) {
      switch (event) {
      case EVENTS.send:
        this.onSend()
        break
      case EVENTS.cancel:
        this.$router.push({ name: HomePage.name })
        break
      case EVENTS.accounts:
        this.accountModal = true
        break
      case EVENTS.contacts:
        this.contactModal = true
        break
      default:
        break
      }
    },
    /**
     * Select address from storage.
     * @param {String, Bech32} address Zilliqa address.
     */
    onAddress(address) {
      this.recipientAddress.model = toAddress(
        address,
        ADDRESS_FORMAT_VARIANTS.bech32,
        false
      )

      this.recipientAddress.error = null
      this.accountModal = false
      this.contactModal = false
    },
    async fromZNS() {
      this.recipientAddress.error = null
      const regExpDomain = new RegExp(REGX_PATTERNS.domain, 'gm')

      if (regExpDomain.test(this.recipientAddress.model)) {
        const bg = new Background()

        this.recipientAddress.model = await bg.getZNSAddress(this.recipientAddress.model)
      }
    },
    /**
     * Send to BG and try sign via current account.
     */
    async onSend() {
      if (!this.recipientAddress.model) {
        this.recipientAddress.error = `*${this.local.PASS_RECIPIENT_ADDR}`

        return null
      } else if (!this.testAddress) {
        this.recipientAddress.error = `*${this.local.INCORRECT_ADDR_FORMAT}`

        return null
      } else if (this.testAmount) {
        this.amount.error = `*${this.local.INSUFFICIENT_FUNDS}`

        return null
      }

      // Default gasLimit and gasPrice.
      const { gasLimit, gasPrice } = this.defaultGas
      // Generate tx params.
      const txParams = {
        toAddr: this.recipientAddress.model,
        amount: toZIL(this.amount.model),
        gasPrice: units.toQa(gasPrice, units.Units.Li).toString(),
        gasLimit: gasLimit,
        code: '',
        data: '',
        uuid: false
      }

      this.setConfirmationTx(txParams)
      this.$router.push({ name: PopupPage.name })
    },
    toMaxAmount() {
      const { gasLimit, gasPrice } = this.defaultGas

      this.amount.model = this.calcMaxAmount(
        gasLimit,
        gasPrice,
        this.getCurrentAccount.balance
      )
    }
  },
  mounted() {
    this.recipientAddress.model = this.$router.currentRoute.params.address
  }
}
</script>

<style lang="scss">
.Send {
  &__amount-zil  {
    min-height: 95px;
  }

  &__recipient {
    min-height: 80px;
  }

  &__item-action {
    font-size: 15px;
  }

  &__amount-form {
    display: grid;
    grid-template-columns: 1fr 60px;
    grid-gap: 5px;
    align-items: center;

    padding-top: 180px;
    padding-left: 30px;
    padding-right: 30px;
  }
}
</style>
