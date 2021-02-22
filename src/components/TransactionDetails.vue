<template>
  <div :class="b()">
    <ul :class="b('wrapper')">
      <li>
        <P>
          {{ local.STATUS }}
        </P>
        <P :class="b('status')">
          {{ status.status }}
          <Icon
            :icon="status.icon"
            height="15"
            width="15"
          />
        </P>
      </li>
      <li>
        <P>
          {{ local.SENT }}
        </P>
        <P
          v-tooltip="copytitle"
          :content="account.address | toAddress(addressFormat, false)"
          copy
          nowrap
          @copy="onCopyMixin"
        >
          {{ account.address | toAddress(addressFormat, true) }}
        </P>
      </li>
      <li>
        <P>
          {{ local.RECEIVED }}
        </P>
        <P
          v-tooltip="copytitle"
          :content="transaction.toAddr | toAddress(addressFormat, false)"
          copy
          nowrap
          @copy="onCopyMixin"
        >
          {{ transaction.toAddr | toAddress(addressFormat, true) }}
        </P>
      </li>
      <li>
        <P>
          {{ local.INFO }}
        </P>
        <P nowrap>
          {{ transaction.Info }}
        </P>
      </li>
      <li>
        <P>
          {{ local.HASH }}
        </P>
        <P
          v-tooltip="copytitle"
          :content="'0x' + transaction.TranID"
          copy
          @copy="onCopyMixin"
          nowrap
        >
          0x{{ transaction.TranID }}
        </P>
      </li>
      <li>
        <P>
          {{ local.NONCE }}
        </P>
        <P>
          {{ transaction.nonce }}
        </P>
      </li>
      <li v-if="transaction.gasPrice">
        <P>
          {{ local.GAS_FEE }}
        </P>
        <P>
          {{ gasFee }} {{ DEFAULT_TOKEN.symbol }}
        </P>
      </li>
      <li v-if="transaction.timestamp">
        <P>
          {{ local.TIME }}
        </P>
        <P>
          {{ timeStamp }}
        </P>
      </li>
    </ul>
    <div :class="b('btn-wrapper')">
      <ViewblockLink :hash="transaction.TranID" />
      <Button
        v-if="!transaction.confirmed && !transaction.cancel"
        :color="COLOR_VARIANTS.danger"
        block
        round
        @click="cancel"
      >
        {{ local.CANCEL }}
      </Button>
    </div>
  </div>
</template>

<script>
import Big from 'big.js'

import { mapState, mapMutations, mapGetters } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import transactionsStore from '@/store/transactions'
import accountsStore from '@/store/accounts'

import { DEFAULT_TOKEN } from 'config'
import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  ICON_TYPE,
  ICON_VARIANTS,
  COLOR_VARIANTS
} from '@/config'

import PopupPage from '@/pages/Popup'

import P from '@/components/P'
import ViewblockLink from '@/components/ViewblockLink'
import Icon from '@/components/Icon'
import Button from '@/components/Button'

import { toAddress } from '@/filters'
import CopyMixin from '@/mixins/copy'
import CalcMixin from '@/mixins/calc'

/**
 * Show more information about transaction.
 * @example
 * import TransactionDetails from '@/components/TransactionDetails'
 * <TransactionDetails
 *   :account="getCurrentAccount"
 *   :transaction="selectedTx"
 * />
 */
export default {
  name: 'TransactionDetails',
  components: {
    P,
    ViewblockLink,
    Icon,
    Button
  },
  mixins: [CopyMixin, CalcMixin],
  filters: { toAddress },
  props: {
    account: {
      type: Object,
      required: true
    },
    transaction: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      ICON_VARIANTS,
      COLOR_VARIANTS,
      ICON_TYPE,
      DEFAULT_TOKEN
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat,
      settingsStore.STATE_NAMES.defaultGas,
      settingsStore.STATE_NAMES.blockNumber
    ]),
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ]),

    status() {
      if (!this.transaction.confirmed) {
        return {
          icon: ICON_VARIANTS.statusPadding,
          status: this.local.PENDING
        }
      } else if (this.transaction.error) {
        return {
          icon: ICON_VARIANTS.statusDanger,
          status: this.local.REJECTED
        }
      }

      return {
        icon: ICON_VARIANTS.statusSuccess,
        status: this.local.COMPLETED
      }
    },
    timeStamp() {
      return new Date(this.transaction.timestamp)
        .toLocaleString()
        .replace(/\//g, '-')
    },
    gasFee() {
      let { gasLimit, gasPrice } = this.transaction

      gasPrice = String(this.toLi(gasPrice))

      return this.calcFee(gasLimit, gasPrice)
    }
  },
  methods: {
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setConfirmationTx
    ]),
    cancel() {
      const _one = Big(1)
      const { gasLimit, gasPrice } = this.transaction
      // Generate tx params.
      const txParams = this.buildTxParams({
        gasLimit,
        gasPrice: String(this.toLi(gasPrice).add(_one)),
        toAddr: this.getCurrentAccount.address,
        amount: '0',
        nonce: this.transaction.nonce,
        cancel: true
      }, DEFAULT_TOKEN)

      this.setConfirmationTx(txParams)
      this.$router.push({ name: PopupPage.name })
    }
  }
}
</script>

<style lang="scss">
.TransactionDetails {
  display: inline-flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  min-height: 200px;

  &__wrapper {
    padding: 0;
    list-style: none;
  }

  &__status {
    display: flex;
    align-items: center;

    & > img {
      margin-left: 5px;
    }
  }

  &__btn-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    min-height: 100px;
  }

  &__wrapper > li {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 300px;
    padding: 10px;
    margin-top: 5px;

    background-color: var(--app-background-color);
    border-radius: 7px;

    & > .P {
      max-width: 200px;
    }

    :first-of-type {
      opacity: 0.7;
    }

    @media (max-width: 700px) {
      max-width: 280px;
    }
  }
}
</style>
