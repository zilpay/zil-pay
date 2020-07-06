<template>
  <div :class="b()">
    <BackModal
      :name="$options.name"
      :back="sendModal.step > 0"
      @click="onStep"
    />
    <div :class="b('wrapper')">
      <div
        v-show="sendModal.step === 0"
        :class="b('step')"
      >
        <Input
          v-model="recipientAddress.model"
          :placeholder="placeholder"
          :error="recipientAddress.error"
          round
          autofocus
          @input="fromZNS"
        />
        <Button
          :size="SIZE_VARIANS.sm"
          :color="COLOR_VARIANTS.negative"
          round
          @click="setNumberStep(2)"
        >
          {{ `${this.local.TRANSFER} ${this.local.BETWEEN} ${this.local.MY} ${this.local.ACCOUNTS}` }}
        </Button>
        <Button
          :size="SIZE_VARIANS.sm"
          :color="COLOR_VARIANTS.negative"
          round
          @click="setNumberStep(3)"
        >
          {{ `${this.local.TRANSFER} ${this.local.BETWEEN} ${this.local.MY} ${this.local.CONTACTS}` }}
        </Button>
      </div>
      <ul
        v-show="sendModal.step === 2"
        :class="b('step', { accounts: true })"
      >
        <li
          v-for="(acc, index) of identities"
          :key="index"
          :class="b('acc-item')"
          @click="onAddress(acc.address)"
        >
          <P>
            {{ getAccountName(acc) }}
          </P>
          <SvgInject :variant="ICON_VARIANTS.arrow"/>
        </li>
      </ul>
      <ul
        v-show="sendModal.step === 3"
        :class="b('step', { contacts: true })"
      >
        <li
          v-for="(acc, index) of contactList"
          :key="index"
          :class="b('acc-item')"
          @click="onAddress(acc.address)"
        >
          <P>
            {{ acc.name }}
          </P>
          <SvgInject :variant="ICON_VARIANTS.arrow"/>
        </li>
      </ul>
      <div
        v-show="sendModal.step === 4"
        :class="b('step')"
      >
        <Title :size="SIZE_VARIANS.sm">
          {{ local.TO }}: ({{ recipientAddress.model | trim }})
        </Title>
        <div :class="b('enter')">
          <P>
            {{ local.ENTER_AMOUTNT }}
          </P>
          <a @click="toMaxAmount">
            {{ local.MAX }}
          </a>
        </div>
        <input
          v-model="amount.model"
          :class="b('amount')"
          :type="INPUT_TYPES.number"
          pattern="[0-9]*"
          required
          @input="amount.error = null"
        />
        <P :variant="COLOR_VARIANTS.danger">
          {{ amount.error }}
        </P>
      </div>
      <Tabs
        v-show="sendModal.step === 0 || sendModal.step === 4"
        :class="b('tabs')"
        :elements="tabsElements"
        @input="onEvent"
      />
    </div>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import { isBech32 } from '@zilliqa-js/util/dist/validation'

import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  ICON_VARIANTS,
  ADDRESS_FORMAT_VARIANTS,
  REGX_PATTERNS
} from '@/config'

import { mapMutations, mapState, mapGetters } from 'vuex'
import uiStore from '@/store/ui'
import tokenStore from '@/store/token'
import contactsStore from '@/store/contacts'
import modalStore from '@/store/modal'
import settingsStore from '@/store/settings'
import accountsStore from '@/store/accounts'
import transactionsStore from '@/store/transactions'

import PopupPage from '@/pages/Popup'

import BackModal from '@/components/BackModal'
import Input, { INPUT_TYPES } from '@/components/Input'
import Tabs from '@/components/Tabs'
import P from '@/components/P'
import Title from '@/components/Title'
import Button from '@/components/Button'
import SvgInject from '@/components/SvgInject'

import { Background } from '@/services'

import { toAddress, trim } from '@/filters'
import CalcMixin from '@/mixins/calc'
import AccountMixin from '@/mixins/account'

const EVENTS = {
  cancel: uuid(),
  proceed: uuid(),
  send: uuid()
}

export default {
  name: 'Send',
  mixins: [CalcMixin, AccountMixin],
  filters: { toAddress, trim },
  components: {
    BackModal,
    Tabs,
    Input,
    Button,
    SvgInject,
    P,
    Title
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      ICON_VARIANTS,
      ADDRESS_FORMAT_VARIANTS,
      INPUT_TYPES,

      recipientAddress: {
        model: null,
        error: null
      },
      amount: {
        model: 0,
        error: null
      },
      defaultGasFee: '',
      unwatch: null
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(modalStore.STORE_NAME, [
      modalStore.STATE_NAMES.sendModal
    ]),
    ...mapState(accountsStore.STORE_NAME, [
      accountsStore.STATE_NAMES.identities
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.defaultGas
    ]),
    ...mapState(contactsStore.STORE_NAME, [
      contactsStore.STATE_NAMES.contactList
    ]),
    ...mapGetters(tokenStore.STORE_NAME, [
      tokenStore.GETTERS_NAMES.getSelectedToken
    ]),

    placeholder() {
      return this.local.INPUT_ZIL_ZNS
    },
    tabsElements() {
      return [
        {
          name: this.local.CANCEL,
          event: EVENTS.cancel
        },
        this.sendModal.step === 0 ? {
          name: this.local.PROCEED,
          event: EVENTS.proceed
        } : {
          name: this.local.SEND,
          event: EVENTS.send
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

      return this.calcIsInsufficientFunds(
        this.amount.model,
        gasLimit,
        gasPrice,
        this.getSelectedToken.balance,
        this.getSelectedToken.symbol,
        this.getSelectedToken.decimals
      )
    }
  },
  methods: {
    ...mapMutations(modalStore.STORE_NAME, [
      modalStore.MUTATIONS_NAMES.setShowSendModal,
      modalStore.MUTATIONS_NAMES.setNextStep,
      modalStore.MUTATIONS_NAMES.setPreviousStep,
      modalStore.MUTATIONS_NAMES.setNumberStep
    ]),
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setConfirmationTx
    ]),

    onStep() {
      if (this.sendModal.step === 0) {
        this.setShowSendModal()
        this.recipientAddress.error = null

        return null
      }

      this.setNumberStep(0)
    },
    onEvent(index) {
      const { step } = this.sendModal

      if (index === 0) {
        this.setShowSendModal()
      } else if (index === 1 && step === 0) {
        if (!this.recipientAddress.model) {
          this.recipientAddress.error = `*${this.local.PASS_RECIPIENT_ADDR}`

          return null
        } else if (!this.testAddress) {
          this.recipientAddress.error = `*${this.local.INCORRECT_ADDR_FORMAT}`

          return null
        }

        this.setNumberStep(4)
      } else if (index === 1 && step === 4) {
        this.onSend()
      }
    },
    /**
     * Finding the ZNS address by domain.
     */
    async fromZNS() {
      this.recipientAddress.error = null

      const regExpDomain = new RegExp(REGX_PATTERNS.domain, 'gm')

      if (regExpDomain.test(this.recipientAddress.model)) {
        try {
          const bg = new Background()
          this.recipientAddress.model = await bg.getZNSAddress(this.recipientAddress.model)
        } catch (err) {
          this.recipientAddress.error = this.local.NOT_FOUND_ZNS
        }
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
      this.setNumberStep(0)
    },
    /**
     * Send to BG and try sign via current account.
     */
    async onSend() {
      if (this.testAmount) {
        this.amount.error = `*${this.local.INSUFFICIENT_FUNDS}`

        return null
      }
      // Default gasLimit and gasPrice.
      const { gasLimit, gasPrice } = this.defaultGas
      // Generate tx params.
      const txParams = this.buildTxParams({
        gasLimit,
        gasPrice,
        toAddr: this.recipientAddress.model,
        amount: this.amount.model
      }, this.getSelectedToken)

      this.setConfirmationTx(txParams)
      this.$router.push({ name: PopupPage.name })
      this.setShowSendModal()
    },
    toMaxAmount() {
      const { gasLimit, gasPrice } = this.defaultGas

      this.amount.model = this.calcMaxAmount(
        gasLimit,
        gasPrice,
        this.getSelectedToken.balance,
        this.getSelectedToken.decimals
      ).toString()
    }
  }
}
</script>

<style lang="scss">
.Send {
  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 30px;
  }

  &__acc-item {
    cursor: pointer;

    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 260px;

    padding: 10px;
    background-color: var(--app-background-color);
    border-radius: var(--default-border-radius);

    & > svg {
      transform: rotate(180deg);
    }

    &:hover {
      background-color: var(--accent-color-primary);

      & > svg > path {
        stroke: var(--accent-color-black);
      }

      & > .P {
        color: var(--accent-color-black);
      }
    }
  }

  &__enter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 260px;

    & > a {
      cursor: pointer;

      padding: 5px;

      min-width: 40px;
      text-align: center;
      font-size: 12px;

      color: var(--accent-color-primary);
      border: 1px solid var(--accent-color-primary);
      border-radius: 13px;

      &:hover {
        background-color: var(--accent-color-primary);
        color: var(--accent-color-black);
      }
    }
  }

  &__amount {
    padding: 0;
    margin: 0;
    border: 0;

    background: transparent;

    text-align: center;
    font-size: 20px;
    line-height: 23px;

    box-shadow: none;
    color: var(--accent-color-gray);

    -moz-appearance: textfield;
  }

  &__step {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 30px;
    min-height: 140px;
    width: 90%;

    list-style: none;
    padding: 0;

    & > .Input {
      width: 100%;
      min-width: 260px;
    }

    & > .Button {
      min-width: 200px;
    }

    &_accounts,
    &_contacts {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: normal;

      padding-left: 20px;
      padding-right: 20px;

      overflow-y: scroll;

      & > li {
        margin-top: 5px;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
