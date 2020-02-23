<template>
  <div :class="b()">
    <Alert
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
    <Container :class="b('wrapper')">
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
    </Container>
    <Separator />
    <Container
      v-show="getCurrent.data"
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

import { mapState, mapGetters, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import accountsStore from '@/store/accounts'
import uiStore from '@/store/ui'
import transactionsStore from '@/store/transactions'

import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  COLOR_VARIANTS,
  ICON_VARIANTS
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

import TxDataPage from '@/pages/popup/TxData'
import HomePage from '@/pages/Home'

import viewblockMixin from '@/mixins/viewblock'
import CalcMixin from '@/mixins/calc'
import { fromZil, toConversion, toAddress } from '@/filters'

import { Background } from '@/services'

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
    ArrowInCircle
  },
  mixins: [viewblockMixin, CalcMixin],
  filters: { fromZil, toConversion, toAddress },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      DEFAULT_GAS_FEE,
      ICON_VARIANTS
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
      transactionsStore.MUTATIONS_NAMES.setEmpty
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
    onReject() {
      this.popupClouse()
    },
    /**
     * When confirmed tx.
     */
    async onConfirm() {
      const bg = new Background()

      bg.sendToSignBroadcasting(this.getCurrent)
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
    popupClouse() {
      if (!this.getCurrent.uuid) {
        this.setEmpty()
        this.$router.push({ name: HomePage.name })

        return null
      }

      if (!this.confirmationTx || this.confirmationTx.length < 1) {
        window.close()
      }
    }
  }
}
</script>

<style lang="scss">
.Popup {
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

  &__amount {
    display: flex;
    justify-content: space-between;

    width: 100%;
    max-width: 250px;
    font-size: 15px;
    line-height: 0;
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
}
</style>
