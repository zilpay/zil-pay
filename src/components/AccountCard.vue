<template>
  <div :class="b({ selected })">
    <div
      :id="account.address"
      @click="onSelectedCard"
    />
    <div :class="b('wrapper')">
      <Title
        :variant="COLOR_VARIANTS.primary"
        :size="SIZE_VARIANS.sm"
        @click="onSelectedCard"
      >
        {{ getAccountName(account) }}
      </Title>
      <div
        :class="b('balance')"
        @click="onSelectedCard"
      >
        <Title
          :variant="COLOR_VARIANTS.gray"
          :size="SIZE_VARIANS.xs"
        >
          {{ account.balance | fromZil }} ZIL
        </Title>
        <Title
          :variant="COLOR_VARIANTS.gray"
          :size="SIZE_VARIANS.xs"
        >
          {{ account.balance | toConversion(getRate) }} {{ currency }}
        </Title>
      </div>
      <P
        v-tooltip="copytitle"
        :class="b('address')"
        :size="SIZE_VARIANS.xs"
        :variant="COLOR_VARIANTS.gray"
        :content="account.address | toAddress(addressFormat, false)"
        copy
        @copy="onCopyMixin"
      >
        {{ account.address | toAddress(addressFormat, true) }}
      </P>
    </div>
    <div
      v-show="trash"
      :class="b('close')"
      @click="onRemove"
    >
      <SvgInject :variant="ICON_VARIANTS.close"/>
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
import P from '@/components/P'
import SvgInject from '@/components/SvgInject'

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
    SvgInject,
    P
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
      this.account.address,
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

  width: 260px;

  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;

  background-color: var(--accent-color-second);
  border-radius: 10px;

  &__wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    width: 100%;
    height: 60px;

    margin-left: 10px;
  }

  &__close {
    cursor: pointer;

    position: absolute;
    transform: translate(1750%, -100%);

    & > svg {
      height: 15px;
      width: auto;
    }
  }

  &__balance {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__address {
    padding: 0;
    margin: 0;
  }

  &_selected {
    border: 2px solid var(--accent-color-primary);
  }
}
</style>
