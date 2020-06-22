<template>
  <div :class="b()">
    <SvgInject
      :class="b('logo')"
      :variant="ICON_VARIANTS.zilPayLogo"
    />
    <a
      :class="b('new-link')"
      :href="url"
      target="_blank"
    >
      <P>
        {{ local.NEW_WALLET }}
      </P>
    </a>
    <Container :class="b('wrapper')">
      <Title
        :font="FONT_VARIANTS.bold"
        :size="SIZE_VARIANS.md"
      >
        {{ local.WELCOME_BACK }}
      </Title>
      <form @submit.prevent="onUnlock">
        <Input
          v-model="password"
          :class="b('password')"
          :type="INPUT_TYPES.password"
          :size="SIZE_VARIANS.xs"
          :placeholder="local.PASSWORD"
          :error="error"
          block
          round
          centred
          required
          autofocus
          @input="error = null"
        />
        <Button
          :class="b('btn')"
          :size="SIZE_VARIANS.md"
          :color="COLOR_VARIANTS.negative"
          round
        >
          {{ local.CONTINUE }}
        </Button>
        <router-link :to="restorePageName">
          <P
            :font="FONT_VARIANTS.regular"
            :size="SIZE_VARIANS.sm"
            capitalize
          >
            {{ local.RESTORE }}
          </P>
        </router-link>
      </form>
    </Container>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'
import settingsStore from '@/store/settings'
import transactionsStore from '@/store/transactions'

import {
  ICON_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS,
  COLOR_VARIANTS
} from '@/config'

import HomePage from '@/pages/Home'
import PopupPage from '@/pages/Popup'
import ConnectPage from '@/pages/Connect'
import RestorePage from '@/pages/Restore'
import FirstStart from '@/pages/FirstStart'

import Container from '@/components/Container'
import SvgInject from '@/components/SvgInject'
import Title from '@/components/Title'
import P from '@/components/P'
import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'

import { Background } from '@/services'

const { window } = global

export default {
  name: 'LockScreen',
  components: {
    Title,
    P,
    SvgInject,
    Input,
    Button,
    Container
  },
  data() {
    return {
      // Proxy constants:
      ICON_VARIANTS,
      FONT_VARIANTS,
      SIZE_VARIANS,
      INPUT_TYPES,
      COLOR_VARIANTS,

      // Locals:
      password: null,
      error: null,
      restorePageName: RestorePage.name
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(walletStore.STORE_NAME, [
      walletStore.STATE_NAMES.isReady,
      walletStore.STATE_NAMES.networkStatus
    ]),
    ...mapState(transactionsStore.STORE_NAME, [
      transactionsStore.STATE_NAMES.confirmationTx
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.connect
    ]),

    url() {
      const { origin, pathname } = window.location

      return `${origin}${pathname}#/${FirstStart.name}`
    }
  },
  methods: {
    ...mapMutations(walletStore.STORE_NAME, [
      walletStore.MUTATIONS_NAMES.setAuth
    ]),

    async onUnlock() {
      const bg = new Background()

      try {
        const isEnable = await bg.unlockWallet(this.password)

        this.setAuth({
          isEnable,
          isReady: this.isReady,
          networkStatus: this.networkStatus
        })

        if (this.confirmationTx && this.confirmationTx.length > 0) {
          this.$router.push({ name: PopupPage.name })

          return null
        } else if (this.connect && Object.keys(this.connect).length > 0) {
          this.$router.push({ name: ConnectPage.name })

          return null
        }

        this.$router.push({ name: HomePage.name })
      } catch (err) {
        this.error = `${this.local.INCORRECT} ${this.local.PASSWORD}!`
      }
    }
  }
}
</script>

<style lang="scss">
.LockScreen {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__logo {
    width: 40vw;
    height: auto;
    margin-top: 80px;

    @media (max-width: 700px) {
      width: 70vw;
    }
  }

  &__new-link {
    position: absolute;
    right: 20px;
    top: 20px;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 260px;
    z-index: 1;

    & > * {
      width: 100%;
      text-align: center;
      margin-top: 20px;
    }

    & > form {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 150px;
    }

    & > form > .Button {
      min-width: 180px;
    }
  }

  &__btn {
    max-width: 180px;
  }
}
</style>
