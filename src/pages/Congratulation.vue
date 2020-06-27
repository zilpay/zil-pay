<template>
  <div :class="b()">
    <router-link
      :class="b('link')"
      :to="LINKS.home"
    >
      <P>
        {{ local.CONGRATULATION_LINK }}
      </P>
    </router-link>
    <SvgInject
      :class="b('logo')"
      :variant="ICON_VARIANTS.zilPayLogo"
    />
    <div :class="b('wrapper')">
      <div>
        <Title :size="SIZE_VARIANS.lg">
          {{ local.CONGRATULATION_TITLE }}
        </Title>
        <P :size="SIZE_VARIANS.md">
          {{ local.CONGRATULATION_DESCRIPTION }}
        </P>
      </div>
      <div :class="b('list')">
        <Title
          :variant="COLOR_VARIANTS.primary"
          :size="SIZE_VARIANS.sm"
        >
          {{ local.CONGRATULATION_SUBTITLE }}
        </Title>
        <ul>
          <li
            v-for="(item, index) of local.CONGRATULATION_LIST"
            :key="index"
          >
            <P>
              {{ item }}
            </P>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import uiStore from '@/store/ui'
import settingsStore from '@/store/settings'
import contactsStore from '@/store/contacts'
import accountsStore from '@/store/accounts'
import transactionsStore from '@/store/transactions'
import walletStore from '@/store/wallet'

import { SIZE_VARIANS, COLOR_VARIANTS, ICON_VARIANTS } from '@/config'

import Home from '@/pages/Home'

import SvgInject from '@/components/SvgInject'
import Title from '@/components/Title'
import P from '@/components/P'

import { getStorageData } from '@/services'

export default {
  name: 'Congratulation',
  components: {
    SvgInject,
    Title,
    P
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      ICON_VARIANTS,

      LINKS: {
        home: Home.name
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
  },
  methods: {
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
    ...mapMutations(accountsStore.STORE_NAME, [
      accountsStore.MUTATIONS_NAMES.setAccounts,
      accountsStore.MUTATIONS_NAMES.setAccount
    ]),
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.updateRate,
      settingsStore.ACTIONS_NAMES.onUpdateSettings
    ]),
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setNetwork,
      settingsStore.MUTATIONS_NAMES.setNetworkConfig
    ]),
    ...mapActions(walletStore.STORE_NAME, [
      walletStore.ACTIONS_NAMES.onInit
    ]),
    ...mapActions(contactsStore.STORE_NAME, [
      contactsStore.ACTIONS_NAMES.onUpdate
    ]),
    ...mapActions(transactionsStore.STORE_NAME, [
      transactionsStore.ACTIONS_NAMES.onUpdateTransactions
    ]),

    async storeUpdate() {
      const storageData = await getStorageData()

      if (!storageData) {
        return null
      }

      const { wallet, config, selectednet } = storageData

      this.setAccounts(wallet.identities)
      this.setAccount(wallet.selectedAddress)

      this.setNetwork(selectednet)
      this.setNetworkConfig(config)
    }
  },
  async beforeMount() {
    this.setLoad()

    try {
      await this.onInit()
      await this.storeUpdate()
      await this.onUpdate()
      await this.onUpdateTransactions()

      await this.updateRate()
      await this.onUpdateSettings()
    } catch (err) {
      console.warn(err)
    }

    this.setLoad()
  }
}
</script>

<style lang="scss">
.Congratulation {
  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;

  background-color: var(--app-background-color);

  &__logo {
    position: absolute;

    width: 50vw;
    height: 50vh;
  }

  &__link {
    position: absolute;
    right: 30px;
    top: 30px;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    max-width: 660px;
    min-height: 50vh;

    margin-bottom: 32vh;

    z-index: 1;

    @media (max-width: 494px) {
      margin-bottom: 0;
    }
  }

  &__list {
    padding: 20px;
    text-align: left;

    background: var(--opacity-bg-element);
    border: 2px solid var(--accent-color-primary);
    border-radius: var(--default-border-radius);
    color: var(--theme-color-font);
  }
}
</style>
