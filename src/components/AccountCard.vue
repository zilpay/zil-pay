<template>
  <div :class="b({ selected })">
    <div id="jazzicon" />
    <div :class="b('wrapper')">
      <Title
        :variant="COLOR_VARIANTS.primary"
        :size="SIZE_VARIANS.sm"
      >
        {{ getAccountName(account) }}
      </Title>
      <div>
        <Title
          :variant="COLOR_VARIANTS.gray"
          :size="SIZE_VARIANS.xs"
        >
          ZIL {{ account.balance | fromZil }}
        </Title>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import {
  FONT_VARIANTS,
  SIZE_VARIANS,
  ICON_VARIANTS,
  COLOR_VARIANTS,
  HW_VARIANTS,
  ADDRESS_FORMAT_VARIANTS,
  EVENTS
} from '@/config'

import Title from '@/components/Title'

import { fromZil, toConversion, toAddress } from '@/filters'
import CopyMixin from '@/mixins/copy'
import AccountMixin from '@/mixins/account'
import JazziconMixin from '@/mixins/jazzicon'

/**
 * Account card component show some information about [balance, address, type].
 * @param account Is full account object.
 * @param selected Show icons `selected`.
 * @param trash Show trash icon.
 * @event selected Select new account, returns account object.
 * @event remove Remove account, returns account object.
 * @example
 * import AccountCard from '@/components/AccountCard'
 * const acc = {
 *   address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F',
 *   balance: '463851500000000',
 *   index: 0,
 *   name: 'Account 0'
 * },
 * <AccountCard
 *   :account="acc"
 *   :selected="true" // This account has as selected.
 *   :trash="true" // If can remove, emiting `remove` event.
 * />
 */
export default {
  name: 'AccountCard',
  components: {
    Title,
    // Icon,
    // Trash,
    // P
  },
  mixins: [CopyMixin, AccountMixin, JazziconMixin],
  filters: { fromZil, toConversion, toAddress },
  props: {
    account: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      required: true
    },
    trash: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      ICON_VARIANTS,
      COLOR_VARIANTS,
      HW_VARIANTS,
      ADDRESS_FORMAT_VARIANTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat,
      settingsStore.STATE_NAMES.currency
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getRate
    ]),

    watermarkIcon() {
      if (this.account.hwType === this.HW_VARIANTS.ledger) {
        return this.ICON_VARIANTS.ledgerWatermark
      }

      return this.ICON_VARIANTS.zilliqaWatermark
    }
  },
  mounted() {
    [
      'address',
      'balance',
      'index'
    ].forEach(key => {
      if (!(key in this.account)) {
        throw new Error(`Property ${key} is required.`)
      }
    })

    this.jazziconCreate(
      'jazzicon',
      this.account.address
    )
  },
  methods: {
    onSelectedCard() {
      this.$emit(EVENTS.selected, this.account)
    },
    onRemove() {
      this.$emit(EVENTS.remove, this.account)
    }
  }
}
</script>

<style lang="scss">
.AccountCard {
  cursor: pointer;

  display: flex;
  align-items: center;

  width: 250px;

  padding: 15px;

  background-color: var(--accent-color-second);
  border-radius: 10px;

  &_selected {
    border: 1px solid var(--accent-color-primary);
  }
}
</style>
