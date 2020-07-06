<template>
  <div :class="b()">
    <div :class="b('to-from')">
      <P
        :content="account.address | toAddress(addressFormat, false)"
        copy
        @copy="onCopyMixin"
      >
        {{ account.address | toAddress(addressFormat) }}
      </P>
      <SvgInject :variant="ICON_VARIANTS.arrow" />
      <P
        :content="transaction.toAddr | toAddress(addressFormat, false)"
        copy
        @copy="onCopyMixin"
      >
        {{ transaction.toAddr | toAddress(addressFormat) }}
      </P>
    </div>
    <ul>
      <li
        v-for="(el) of infoList"
        :key="el.key"
      >
        <P :size="SIZE_VARIANS.xs">
          {{ el.key }}
        </P>
        <P
          v-if="el.copy"
          v-tooltip.left="copytitle"
          :content="el.value"
          nowrap
          copy
        >
          {{ el.value }}
        </P>
        <P
          v-else
          nowrap
        >
          {{ el.value }}
        </P>
      </li>
    </ul>
    <ViewblockLink :hash="transaction.TranID" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import settingsStore from '@/store/settings'

import { SIZE_VARIANS, FONT_VARIANTS, ICON_TYPE, ICON_VARIANTS } from '@/config'

import P from '@/components/P'
import ViewblockLink from '@/components/ViewblockLink'
import SvgInject from '@/components/SvgInject'

import { toAddress } from '@/filters'
import CopyMixin from '@/mixins/copy'

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
    SvgInject
  },
  mixins: [CopyMixin],
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
      ICON_TYPE
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
    ]),

    infoList() {
      return [
        {
          key: 'Info',
          value: this.transaction.Info
        },
        {
          key: 'Hash',
          value: this.transaction.TranID,
          copy: true
        },
        {
          key: 'Nonce',
          value: this.transaction.nonce
        },
        {
          key: 'Block',
          value: this.transaction.block
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.TransactionDetails {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  width: 100%;
  min-height: 200px;

  &__to-from {
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    min-width: 300px;

    & > svg {
      transform: rotate(180deg);
    }
  }

  & > ul {
    width: 95%;
    max-width: 400px;

    padding: 10px;
    list-style: none;
  }

  & > ul > li {
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > .P {
      max-width: 150px;
      line-height: 15px;
    }
  }

  & > .Button {
    display: flex;
    align-items: center;
    justify-content: space-around;

    width: 100%;
    height: 43px;
    max-width: 200px;
  }
}
</style>
