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
        <li
          v-for="(el, index) of items"
          :key="index"
          @click="onItem(el.event)"
        >
          <Icon
            :icon="el.icon"
            :type="el.type"
          />
          <Title :size="SIZE_VARIANS.sm">
            {{ el.title }}
          </Title>
          <P
            :class="b('des')"
            :font="FONT_VARIANTS.regular"
          >
            {{ el.text }}
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

import { ICON_TYPE, ICON_VARIANTS, SIZE_VARIANS, FONT_VARIANTS, COLOR_VARIANTS } from '@/config'

import Title from '@/components/Title'
import P from '@/components/P'
import BackModal from '@/components/BackModal'
import Icon from '@/components/Icon'

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
    BackModal,
    Icon
  },
  mixins: [LinksMixin],
  data() {
    return {
      ICON_VARIANTS,
      SIZE_VARIANS,
      FONT_VARIANTS,
      COLOR_VARIANTS
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
    ]),

    items() {
      const [mainnet] = Object.keys(this.networkConfig)
      const elements = [{
        title: `${this.local.DEPOSIT} $ZIL.`,
        text: this.local.TRANSFER_DES,
        event: EVENTS.transfer,
        icon: ICON_VARIANTS.zilliqaLogo,
        type: ICON_TYPE.svg
      }]
      if (mainnet === this.network) {
        elements.push({
          title: `${this.local.BUY} ${this.local.BUY_ON}.`,
          text: this.local.BUY_DES,
          event: EVENTS.buy,
          icon: ICON_VARIANTS.coinswitch,
          type: ICON_TYPE.png
        })
      } else {
        elements.push({
          title: this.local.TEST_FAUCET,
          text: this.local.TEST_FAUCET_DES,
          event: EVENTS.faucet,
          icon: ICON_VARIANTS.zilliqaLogo,
          type: ICON_TYPE.svg
        })
      }
      return elements
    }
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
      padding: 10px;
      max-width: 110px;
      text-align: center;
      border-radius: var(--default-border-radius);
      border: 2px solid var(--accent-color-primary);

      & > img {
        height: 60px;
        width: auto;
      }

      &:hover {
        background-color: var(--accent-color-primary);

        & > * {
          color: var(--accent-color-black);
        }
      }
    }
  }
}
</style>
