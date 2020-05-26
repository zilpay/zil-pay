<template>
  <div :class="b()">
    <Alert
      v-if="getCurrentAccount"
      :class="b('from')"
      pointer
      @click="onFrom"
    >
      <Title
        :size="SIZE_VARIANS.sm"
        :font="FONT_VARIANTS.bold"
      >
        {{ local.ADDRESS }} {{ local.FROM }}:
      </Title>
      <P>
        {{ getCurrentAccount.address | toAddress(addressFormat, false) }}
      </P>
    </Alert>
    <Container
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
      <GasControl
        :value="getCurrentGas"
        :DEFAULT="DEFAULT_GAS_FEE"
        @input="setCurrentGas"
      />
      <div :class="b('amount')">
        <P
          :font="FONT_VARIANTS.bold"
          :variant="amountColor"
        >
          {{ local.AMOUNT }}
        </P>
        <P
          :font="FONT_VARIANTS.bold"
          :variant="amountColor"
        >
          ZIL{{ getCurrent.amount | fromZil }}
        </P>
      </div>
      <Container :class="b('to-ds')">
        <P :font="FONT_VARIANTS.bold">
          TODS
        </P>
        <SwitchBox
          :value="getCurrent.priority"
          @input="setPriority"
        />
      </Container>
    </Container>
    <Separator />
    <P
      :class="b('error-msg')"
      :variant="COLOR_VARIANTS.danger"
      :font="FONT_VARIANTS.regular"
      :size="SIZE_VARIANS.sm"
      centred
    >
      {{ error }}
    </P>
    <Container
      v-if="getCurrent && getCurrent.data"
      :class="b('details')"
      @click="onDetails"
    >
      <Title
        :size="SIZE_VARIANS.md"
        :font="FONT_VARIANTS.regular"
      >
        {{ local.VIEW }} {{ local.DETAILS }}
      </Title>
      <ArrowInCircle
        width="40"
        height="40"
      />
    </Container>
    <Alert
      v-if="getCurrent"
      :class="b('to')"
      pointer
      @click="onTo"
    >
      <Title
        :size="SIZE_VARIANS.sm"
        :font="FONT_VARIANTS.bold"
      >
        {{ local.ADDRESS }} {{ local.TO }}:
      </Title>
      <P>
        {{ getCurrent.toAddr | toAddress(addressFormat, false) }}
      </P>
    </Alert>
    <BottomBar
      :elements="bottomBar"
      @click="onEvent"
    />
  </div>
</template>

<script>
import { uuid } from 'uuidv4'

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import settingsStore from '@/store/settings'
import accountsStore from '@/store/accounts'
import uiStore from '@/store/ui'
import transactionsStore from '@/store/transactions'

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
import Container from '@/components/Container'
import GasControl from '@/components/GasControl'
import Separator from '@/components/Separator'
import BottomBar from '@/components/BottomBar'
import ArrowInCircle from '@/components/icons/ArrowInCircle'
import SwitchBox from '@/components/SwitchBox'

import TxDataPage from '@/pages/popup/TxData'
import HomePage from '@/pages/Home'

import viewblockMixin from '@/mixins/viewblock'
import CalcMixin from '@/mixins/calc'
import { fromZil, toConversion, toAddress } from '@/filters'

import { Background, ledgerSendTransaction } from '@/services'

const { window } = global
const BOTTOM_BAR_EVENTS = {
  confirm: uuid(),
  reject: uuid()
}

export default {
  name: 'Popup',
  components: {
    Alert,
    Title,
    P,
    Icon,
    GasControl,
    Container,
    Separator,
    BottomBar,
    ArrowInCircle,
    SwitchBox
  },
  mixins: [viewblockMixin, CalcMixin],
  filters: { fromZil, toConversion, toAddress },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      DEFAULT_GAS_FEE,
      COLOR_VARIANTS,
      ICON_VARIANTS,

      error: null
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

    bottomBar() {
      return [
        {
          value: this.local.REJECT,
          event: BOTTOM_BAR_EVENTS.reject,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm
        },
        {
          value: this.local.CONFIRM,
          event: BOTTOM_BAR_EVENTS.confirm,
          size: SIZE_VARIANS.sm,
          variant: COLOR_VARIANTS.primary
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
      if (!this.getCurrentAccount) {
        return null
      }

      const { gasLimit, gasPrice } = this.getCurrentGas

      return this.calcIsInsufficientFunds(
        this.getCurrent.amount,
        gasLimit,
        gasPrice,
        this.getCurrentAccount.balance
      )
    }
  },
  methods: {
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setCurrentGas,
      transactionsStore.MUTATIONS_NAMES.setEmpty,
      transactionsStore.MUTATIONS_NAMES.setPriority,
      transactionsStore.MUTATIONS_NAMES.setPopConfirmTx
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
    ...mapActions(transactionsStore.STORE_NAME, [
      transactionsStore.ACTIONS_NAMES.onUpdateTransactions,
      transactionsStore.ACTIONS_NAMES.setRejectedLastTx
    ]),
    ...mapActions(accountsStore.STORE_NAME, [
      accountsStore.ACTIONS_NAMES.updateCurrentAccount
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
     * Go to the Details tx data.
     */
    onDetails() {
      this.$router.push({ name: TxDataPage.name })
    },

    /**
     * When rejected tx.
     */
    async onReject() {
      this.setLoad()

      if (this.getCurrent && this.getCurrent.uuid) {
        await this.setRejectedLastTx()
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
      case BOTTOM_BAR_EVENTS.reject:
        this.onReject()
        break
      case BOTTOM_BAR_EVENTS.confirm:
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
      if (this.getCurrent && !this.getCurrent.uuid) {
        this.setEmpty()
        await this.onUpdateTransactions()
        this.$router.push({ name: HomePage.name })

        return null
      }

      await this.setPopConfirmTx()

      if (!this.confirmationTx || this.confirmationTx.length === 0) {
        window.close()
      }
    }
  },
  mounted() {
    this.setLoad()
    this
      .updateCurrentAccount()
      .then(() => this.setLoad())
  }
}
</script>

<style lang="scss">
.Popup {
  min-width: 360px;

  &__from,
  &__to {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 80px;
    font-size: 13px;
  }

  &__wrapper {
    display: grid;
    grid-gap: 15px;
    align-items: center;
    justify-items: center;

    padding: 15px 30px 30px 30px;
  }

  &__amount,
  &__to-ds {
    font-size: 15px;
    line-height: 0;
  }

  &__amount {
    display: flex;
    justify-content: space-between;

    width: 100%;
    max-width: 250px;
  }

  &__to-ds {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 250px;
  }

  &__details {
    position: fixed;
    bottom: 130px;
    right: 30px;

    cursor: pointer;

    display: grid;
    align-items: center;
    grid-template-columns: 1fr 40px;
    grid-gap: 10px;
  }

  &__to {
    position: fixed;
    bottom: 40px;
    z-index: 1;
  }

  &__error-msg {
    padding-top: 5px;
  }
}
</style>
