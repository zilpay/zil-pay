<template>
  <div
    v-if="getCurrentAccount"
    :class="b()"
  >
    <div :class="b('header')">
      <div>
        <SvgInject :variant="ICON_VARIANTS.burger"/>
      </div>
      <div
        v-tooltip="copytitle"
        :class="b('account')"
        @click="onCopyMixin(toAddress(getCurrentAccount.address, addressFormat, false))"
      >
        <Title :class="b('a-name')">
          {{ getAccountName(getCurrentAccount) }}
        </Title>
        <P
          :variant="COLOR_VARIANTS.primary"
          :size="SIZE_VARIANS.xs"
        >
          {{ getCurrentAccount.address | toAddress(addressFormat) }}
        </P>
      </div>
      <div id="jazzicon"/>
    </div>
    <div :class="b('info')">
      <Title
        :class="b('balance')"
        :size="SIZE_VARIANS.sm"
        :variant="COLOR_VARIANTS.primary"
      >
        <span>
          {{ getCurrentAccount.balance | fromZil }} ZIL
        </span>
        <div
          class="pointer"
          @click="onRefresh"
        >
          <SvgInject :variant="ICON_VARIANTS.refresh"/>
        </div>
      </Title>
      <P
        :variant="COLOR_VARIANTS.gray"
        :size="SIZE_VARIANS.xs"
        :font="FONT_VARIANTS.light"
      >
        {{ getCurrentAccount.balance | toConversion(getRate) }} {{ currency }}
      </P>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import accountsStore from '@/store/accounts'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'

import { ICON_VARIANTS, COLOR_VARIANTS, SIZE_VARIANS, FONT_VARIANTS } from '@/config'

import SvgInject from '@/components/SvgInject'
import P from '@/components/P'
import Title from '@/components/Title'

import AccountMixin from '@/mixins/account'
import CopyMixin from '@/mixins/copy'
import JazziconMixin from '@/mixins/jazzicon'
import { toAddress, fromZil, toConversion } from '@/filters'

export default {
  name: 'HomeAccount',
  mixins: [AccountMixin, CopyMixin, JazziconMixin],
  filters: { toAddress, fromZil, toConversion },
  components: {
    SvgInject,
    P,
    Title
  },
  data() {
    return {
      ICON_VARIANTS,
      COLOR_VARIANTS,
      SIZE_VARIANS,
      FONT_VARIANTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat,
      settingsStore.STATE_NAMES.currency
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getRate
    ])
  },
  methods: {
    toAddress,

    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.updateRate
    ]),
    ...mapActions(accountsStore.STORE_NAME, [
      accountsStore.ACTIONS_NAMES.updateCurrentAccount
    ]),
    ...mapActions(walletStore.STORE_NAME, [
      walletStore.ACTIONS_NAMES.checkProvider
    ]),

    async onRefresh() {
      this.setLoad()
      try {
        await this.updateRate()
        await this.checkProvider()
        await this.updateCurrentAccount()
      } catch (err) {
        //
      } finally {
        this.setLoad()
      }
    }
  },
  watch: {
    getCurrentAccount(value) {
      if (value && value.address) {
        this.jazziconCreate(
          'jazzicon',
          value.address
        )
      }
    }
  }
}
</script>

<style lang="scss">
#jazzicon {
  cursor: pointer;
}
.HomeAccount {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    max-width: 300px;
  }

  &__account {
    display: flex;
    flex-direction: column;
    align-items: center;

    cursor: pointer;
    padding: 10px;
    border-radius: 10px;

    &:hover {
      background: var(--opacity-bg-element-1);
    }
  }

  &__a-name {
    font-size: 14px;
  }

  &__balance {
    display: grid;
    grid-template-columns: 1fr 26px;
    align-items: center;
    justify-items: center;
    grid-gap: 10px;

    max-width: 340px;
    min-width: 200px;
    padding: 5px;
    margin-top: 30px;
    border-radius: 8px;
    border: 1px solid var(--accent-color-primary);

    & > .Title {
      text-align: center;
      width: 100%;
    }

    & > span {
      margin-left: 35px;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 85px;
  }
}
</style>
