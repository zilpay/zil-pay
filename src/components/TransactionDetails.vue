<template>
  <Container :class="b()">
    <div :class="b('sender-recipient')">
      <P
        v-tooltip="copytitle"
        :size="SIZE_VARIANS.xs"
        :content="account.address | toAddress(addressFormat, false)"
        copy
        @copy="onCopyMixin"
      >
        {{ account.address | toAddress(addressFormat) }}
      </P>
      <!-- <Arrow
        height="10"
        width="2"
        right
      /> -->
      <P
        v-tooltip="copytitle"
        :size="SIZE_VARIANS.xs"
        :content="transaction.toAddr | toAddress(addressFormat, false)"
        copy
        @copy="onCopyMixin"
      >
        {{ transaction.toAddr | toAddress(addressFormat) }}
      </P>
    </div>
    <Separator />
    <ul :class="b('info-list')">
      <li
        v-for="(el, index) of infoList"
        :key="index"
        :class="b('info-item')"
      >
        <P
          :size="SIZE_VARIANS.xs"
          :font="FONT_VARIANTS.bold"
        >
          {{ el.key }}
        </P>
        <P
          v-tooltip.left="copytitle"
          :class="b('value')"
          :size="SIZE_VARIANS.xs"
          :content="el.value"
          :font="FONT_VARIANTS.regular"
          copy
          nowrap
          @copy="onCopyMixin"
        >
          {{ el.value }}
        </P>
      </li>
    </ul>
    <ViewblockLink :hash="transaction.TranID"/>
  </Container>
</template>

<script>
import { mapState } from 'vuex'
import settingsStore from '@/store/settings'

import { SIZE_VARIANS, FONT_VARIANTS, ICON_TYPE } from '@/config'

import P from '@/components/P'
import Container from '@/components/Container'
import ViewblockLink from '@/components/ViewblockLink'

import { toAddress, fromZil, toConversion } from '@/filters'
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
    Container,
    P,
    ViewblockLink
  },
  mixins: [CopyMixin],
  filters: { toAddress, fromZil, toConversion },
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
          value: this.transaction.TranID
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
  /* top | right | bottom | left */
  padding: 10px 15px 30px 15px;

  &__sender-recipient {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  &__info-list {
    list-style: none;
    margin: 0;
    padding: 0;
    padding-top: 15px;
  }

  &__info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    border-bottom: 1px solid var(--theme-color-separator);
  }

  &__value {
    max-width: 200px;
  }
}
</style>
