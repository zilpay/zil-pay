<template>
  <div :class="b()">
    <BackModal
      :name="$options.name"
      :back="receiveModal.step > 0"
      @click="onStep"
    />
    <div :class="b('wrapper')">
      <P
        :class="b('des')"
        :font="FONT_VARIANTS.regular"
      >
        {{ local.RECEIVE_DEPOSIT_DIS }}
      </P>
      <ul :class="b('btns')">
        <li>
          <SvgInject :variant="ICON_VARIANTS.wallet"/>
          <Title :size="SIZE_VARIANS.sm">
            {{ local.DEPOSIT }} {{ DEFAULT_TOKEN.symbol }}
          </Title>
          <P
            :class="b('des')"
            :font="FONT_VARIANTS.regular"
          >
            {{ local.TRANSFER_DES }}
          </P>
        </li>
        <li v-show="mainnet === network">
          <SvgInject :variant="ICON_VARIANTS.cart"/>
          <Title :size="SIZE_VARIANS.sm">
            {{ local.BUY }} {{ local.BUY_ON }}
          </Title>
          <P
            :class="b('des')"
            :font="FONT_VARIANTS.regular"
          >
            {{ local.BUY_DES }}
          </P>
        </li>
        <li v-show="mainnet !== network">
          <SvgInject :variant="ICON_VARIANTS.bag"/>
          <Title :size="SIZE_VARIANS.sm">
            {{ local.TEST_FAUCET }}
          </Title>
          <P
            :class="b('des')"
            :font="FONT_VARIANTS.regular"
          >
            {{ local.TEST_FAUCET_DES }}
          </P>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'

import { mapMutations, mapState, mapGetters } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import modalStore from '@/store/modal'
import accountsStore from '@/store/accounts'

import { DEFAULT_TOKEN, ZILLIQA } from 'config'
import { ICON_VARIANTS, SIZE_VARIANS, FONT_VARIANTS, COLOR_VARIANTS } from '@/config'

import Title from '@/components/Title'
import P from '@/components/P'
import BackModal from '@/components/BackModal'
import SvgInject from '@/components/SvgInject'

import { toAddress } from '@/filters'
import LinksMixin from '@/mixins/links'

const EVENTS = {
  faucet: uuid(),
  buy: uuid(),
  transfer: uuid()
}

export default {
  name: 'Receive',
  components: {
    Title,
    P,
    SvgInject,
    BackModal
  },
  mixins: [LinksMixin],
  data() {
    return {
      ICON_VARIANTS,
      SIZE_VARIANS,
      DEFAULT_TOKEN,
      FONT_VARIANTS,
      COLOR_VARIANTS,

      mainnet: Object.keys(ZILLIQA)[0]
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.networkConfig,
      settingsStore.STATE_NAMES.network,
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapState(modalStore.STORE_NAME, [
      modalStore.STATE_NAMES.receiveModal
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ])
  },
  methods: {
    ...mapMutations(modalStore.STORE_NAME, [
      modalStore.MUTATIONS_NAMES.setShowReceiveModal,
      modalStore.MUTATIONS_NAMES.setShowAccountModal
    ]),

    onStep() {
      if (this.receiveModal.step === 0) {
        this.setShowReceiveModal()
      }
    },
    onItem(event) {
      switch (event) {
      case EVENTS.faucet:
        this.linksToFaucet()
        break
      case EVENTS.buy:
        this.linksToCoinswitch(toAddress(
          this.getCurrentAccount.address,
          this.addressFormat,
          false
        ))
        break
      case EVENTS.transfer:
        this.setShowAccountModal()
        break
      default:
        break
      }
    }
  }
}
</script>

<style lang="scss">
.Receive {
  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;

    min-height: 240px;

    padding-left: 20px;
    padding-right: 20px;
  }

  &__des {
    font-size: 12px;
    line-height: 14px;
    text-align: center;
    letter-spacing: -0.139803px;
    margin-top: 10px;
  }

  &__btns {
    display: flex;
    justify-content: space-evenly;

    width: 100%;
    padding: 0;
    list-style: none;

    li {
      cursor: pointer;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;

      padding: 10px;
      max-width: 110px;
      min-height: 190px;

      text-align: center;
      border-radius: 22px;
      border: 2px solid var(--accent-color-gray);

      & > svg {
        height: 32px;
        width: auto;
      }

      &:hover {
        background-color: var(--app-background-color);
        border: 2px solid var(--accent-color-primary);
        box-shadow: 4px 4px 7px var(--app-background-color);

        & > .Title {
          color: var(--accent-color-primary);
        }

        & > svg > path {
          fill: var(--accent-color-primary);
        }
      }
    }
  }
}
</style>
