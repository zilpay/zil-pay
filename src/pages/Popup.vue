<template>
  <div :class="b()">
    <Alert
      v-if="getCurrentAccount"
      pointer
      @click="onFrom"
    >
      <Title
        :size="SIZE_VARIANS.sm"
        :font="FONT_VARIANTS.bold"
      >
        {{ local.ADDRESS }} {{ local.FROM }}:
      </Title>
      <P :size="SIZE_VARIANS.xs">
        {{ getCurrentAccount.address | toAddress(addressFormat, false) }}
      </P>
    </Alert>
    <div
      v-if="getCurrent"
      :class="b('wrapper')"
    >
      <Icon
        v-if="getCurrent.icon"
        :src="getCurrent.icon"
        width="40"
        height="40"
      />
      <Icon
        v-if="!getCurrent.icon"
        :icon="ICON_VARIANTS.zilliqaLogo"
      />
      <div>
        <GasSelecter
          :value="getCurrentGas"
          :defaultValue="gasStarter"
          @input="setCurrentGas"
        />
        <router-link :to="{ name: LINKS.gasAdvanced }">
          <P
            :variant="COLOR_VARIANTS.primary"
            capitalize
            right
          >
            {{ local.ADVANCED }}
          </P>
        </router-link>
      </div>
      <div :class="b('item')">
        <P
          :font="FONT_VARIANTS.bold"
          :variant="amountColor"
          :size="SIZE_VARIANS.sm"
        >
          {{ local.AMOUNT }}
        </P>
        <P
          :font="FONT_VARIANTS.bold"
          :variant="amountColor"
          :size="SIZE_VARIANS.sm"
        >
          {{ amount | fromZil(decimals) }} {{ symbol }}
        </P>
      </div>
      <div :class="b('item')">
        <P
          :font="FONT_VARIANTS.bold"
          :size="SIZE_VARIANS.sm"
        >
          {{ local.SEND }} {{ local.TO }} DS
        </P>
        <SwitchBox
          :value="getCurrent.priority"
          @input="setPriority"
        />
      </div>
    </div>
    <P
      :class="b('error-msg')"
      :variant="COLOR_VARIANTS.danger"
      :font="FONT_VARIANTS.regular"
      :size="SIZE_VARIANS.sm"
      centred
    >
      {{ error }}
    </P>
    <router-link
      v-if="getCurrent && getCurrent.data"
      :to="{ name: LINKS.detail }"
    >
      <P :class="b('details')">
        {{ local.VIEW }} {{ local.DETAILS }} >>
      </P>
    </router-link>
    <Alert
      v-if="getCurrent"
      pointer
      @click="onTo"
    >
      <Title
        :size="SIZE_VARIANS.sm"
        :font="FONT_VARIANTS.bold"
      >
        {{ local.ADDRESS }} {{ local.TO }}:
      </Title>
      <P :size="SIZE_VARIANS.xs">
        {{ addressTo | toAddress(addressFormat, false) }}
      </P>
    </Alert>
    <Tabs
      :elements="tabElements"
      @input="onEvent"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import settingsStore from '@/store/settings'
import accountsStore from '@/store/accounts'
import uiStore from '@/store/ui'
import tokenStore from '@/store/token'
import transactionsStore from '@/store/transactions'

import { DEFAULT, DEFAULT_TOKEN } from 'config'
import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  COLOR_VARIANTS,
  ICON_VARIANTS,
  HW_VARIANTS
} from '@/config'
import { DEFAULT_GAS_FEE } from 'config/zilliqa'

import Alert from '@/components/Alert'
import Title from '@/components/Title'
import P from '@/components/P'
import Icon from '@/components/Icon'
import SwitchBox from '@/components/SwitchBox'
import Tabs from '@/components/Tabs'
import GasSelecter from '@/components/GasSelecter'

import TxDataPage from '@/pages/popup/TxData'
import HomePage from '@/pages/Home'
import SignMessage from '@/pages/SignMessage'

import viewblockMixin from '@/mixins/viewblock'
import CalcMixin from '@/mixins/calc'
import { fromZil, toAddress } from '@/filters'

import { Background, ledgerSendTransaction } from '@/services'

const { window } = global

export default {
  name: 'Popup',
  components: {
    Alert,
    Title,
    P,
    GasSelecter,
    Icon,
    SwitchBox,
    Tabs
  },
  mixins: [viewblockMixin, CalcMixin],
  filters: { fromZil, toAddress },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      DEFAULT_GAS_FEE,
      COLOR_VARIANTS,
      ICON_VARIANTS,
      DEFAULT_TOKEN,
      LINKS: {
        detail: TxDataPage.name,
        gasAdvanced: ''
      },

      error: null,
      lastTx: null,
      gasStarter: JSON.stringify(DEFAULT_GAS_FEE)
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapState(transactionsStore.STORE_NAME, [
      transactionsStore.STATE_NAMES.confirmationTx
    ]),
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ]),
    ...mapGetters(transactionsStore.STORE_NAME, [
      transactionsStore.GETTERS_NAMES.getCurrent,
      transactionsStore.GETTERS_NAMES.getCurrentGas
    ]),
    ...mapGetters(tokenStore.STORE_NAME, [
      tokenStore.GETTERS_NAMES.getSelectedToken,
      tokenStore.GETTERS_NAMES.getDefaultToken
    ]),

    tabElements() {
      return [
        {
          name: this.local.REJECT
        },
        {
          name: this.local.CONFIRM
        }
      ]
    },
    amountColor() {
      if (this.testAmount) {
        return COLOR_VARIANTS.danger
      }

      return null
    },
    /**
     * Testing for insufficient funds.
     */
    testAmount() {
      if (!this.getSelectedToken) {
        return null
      }

      const { gasLimit, gasPrice } = this.getCurrentGas

      return this.calcIsInsufficientFundsUint(
        this.getCurrent.amount,
        gasLimit,
        gasPrice,
        this.balance,
        this.symbol,
        this.decimals
      )
    },
    addressTo() {
      const { symbol } = this.getCurrent

      if (symbol && symbol !== DEFAULT_TOKEN.symbol) {
        return JSON.parse(this.getCurrent.data).params[0].value
      }

      return this.getCurrent.toAddr
    },
    amount() {
      const { symbol } = this.getCurrent

      if (symbol && symbol !== DEFAULT_TOKEN.symbol) {
        return JSON.parse(this.getCurrent.data).params[1].value
      }

      return this.getCurrent.amount
    },
    symbol() {
      const { symbol } = this.getCurrent

      if (symbol && symbol !== DEFAULT_TOKEN.symbol) {
        return symbol
      }

      return DEFAULT_TOKEN.symbol
    },
    balance() {
      const { symbol } = this.getCurrent

      if (symbol && symbol !== DEFAULT_TOKEN.symbol) {
        return this.getSelectedToken.balance
      }

      return this.getDefaultToken.balance
    },
    decimals() {
      const { symbol } = this.getCurrent

      if (symbol && symbol !== DEFAULT_TOKEN.symbol) {
        return this.getSelectedToken.decimals
      }

      return DEFAULT_TOKEN.decimals
    }
  },
  methods: {
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setCurrentGas,
      transactionsStore.MUTATIONS_NAMES.setEmpty,
      transactionsStore.MUTATIONS_NAMES.setPriority
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
    ...mapActions(transactionsStore.STORE_NAME, [
      transactionsStore.ACTIONS_NAMES.onUpdateTransactions,
      transactionsStore.ACTIONS_NAMES.setRejectedLastTx,
      transactionsStore.ACTIONS_NAMES.onUpdateToConfirmTxs
    ]),
    ...mapActions(tokenStore.STORE_NAME, [
      tokenStore.ACTIONS_NAMES.onBalanceUpdate
    ]),

    /**
     * Go to the viewblock address info.
     */
    onTo() {
      this.onViewblockAddress(this.getCurrent.toAddr)
    },
    onFrom() {
      this.onViewblockAddress(this.getCurrentAccount.address)
    },
    /**
     * When rejected tx.
     */
    async onReject() {
      this.setLoad()

      if (this.getCurrent && this.getCurrent.uuid) {
        await this.setRejectedLastTx(this.getCurrent.uuid)
      }

      await this.popupClouse()
      this.setLoad()
    },
    /**
     * When confirmed tx.
     */
    async onConfirm() {
      const bg = new Background()
      const account = this.getCurrentAccount
      let txParams = this.getCurrent

      try {
        this.setLoad()

        if (account.hwType && account.hwType === HW_VARIANTS.ledger) {
          txParams = await ledgerSendTransaction(account.index, txParams)
        }

        await bg.sendToSignBroadcasting(txParams)

        this.popupClouse()
      } catch (err) {
        this.error = err.message
      } finally {
        this.setLoad()
      }
    },
    /**
     * Handle call event.
     */
    onEvent(event) {
      switch (event) {
      case 0:
        this.onReject()
        break
      case 1:
        this.onConfirm()
        break
      default:
        break
      }
    },

    /**
     * To close popup.
     */
    async popupClouse() {
      this.lastTx = this.getCurrent

      await this.onUpdateToConfirmTxs()

      if (this.lastTx && !this.lastTx.uuid) {
        this.setEmpty()
        await this.onUpdateTransactions()
        this.$router.push({ name: HomePage.name })

        return null
      }

      if (this.getCurrent && this.getCurrent.message) {
        this.$router.push({ name: SignMessage.name })

        return null
      }

      if (this.confirmationTx.length === 0) {
        window.close()
      }

      this.$router.push({ name: HomePage.name })
    }
  },
  mounted() {
    if (!this.getCurrent) {
      this.$router.push({ name: HomePage.name })
    }

    if (this.getCurrent && this.getCurrent.uuid) {
      setTimeout(() => this.popupClouse(), DEFAULT.POPUP_CALL_TIMEOUT)
    }

    this.gasStarter = JSON.stringify(this.getCurrentGas)
    this.setLoad()
    this
      .onBalanceUpdate()
      .then(() => this.setLoad())
  },
  updated() {
    if (this.getCurrent && this.getCurrent.message) {
      this.$router.push({ name: SignMessage.name })
    }
  }
}
</script>

<style lang="scss">
.Popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  background-color: var(--app-background-color);

  &__wrapper {
    margin-top: 30px;
    margin-bottom: 30px;

    min-width: 200px;
  }

  &__details {
    text-decoration-line: underline;
    letter-spacing: -0.139803px;
    font-size: 15px;
    line-height: 18px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > .P {
      line-height: 30px;
    }
  }

  &__error-msg {
    min-height: 40px;
  }

  & > a {
    min-width: 250px;
    text-align: right;
  }

  & > .Tabs {
    margin-top: 20px;
  }
}
</style>
