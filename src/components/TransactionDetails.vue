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
          :content="transaction.TranID"
          copy
          @copy="onCopyMixin"
          nowrap
        >
          {{ transaction.TranID }}
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
      <li v-if="transaction.timestamp">
        <P>
          {{ local.TIME }}
        </P>
        <P>
          {{ timeStamp }}
        </P>
      </li>
    </ul>
    <ViewblockLink
      v-if="transaction.confirmed"
      :hash="transaction.TranID"
    />
    <Button
      v-else
      :color="COLOR_VARIANTS.danger"
      block
      round
    >
      {{ local.CANCEL }}
    </Button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  ICON_TYPE,
  ICON_VARIANTS,
  COLOR_VARIANTS
} from '@/config'

import P from '@/components/P'
import ViewblockLink from '@/components/ViewblockLink'
import Icon from '@/components/Icon'
import Button from '@/components/Button'

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
    Icon,
    Button
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
      COLOR_VARIANTS,
      ICON_TYPE
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
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

  & > .Button {
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    margin: 20px;
    width: 100%;

    text-transform: capitalize;
  }
}
</style>
