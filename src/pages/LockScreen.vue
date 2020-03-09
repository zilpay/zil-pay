<template>
  <div :class="b()">
    <Container :class="b('wrapper')">
      <Icon
        :icon="ICON_VARIANTS.zilliqaLogo"
        width="106"
        height="144"
      />
      <Title>
        Zilliqa
      </Title>
      <P :font="FONT_VARIANTS.regular">
        {{ local.WELCOME_BACK }}
      </P>
      <form
        :class="b('form')"
        @submit.prevent="onUnlock"
      >
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
          :size="SIZE_VARIANS.xs"
          block
          round
        >
          {{ local.CONTINUE }}
        </Button>
      </form>
    </Container>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'

import {
  ICON_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS
} from '@/config'

import HomePage from '@/pages/Home'

import Container from '@/components/Container'
import Icon from '@/components/Icon'
import Title from '@/components/Title'
import P from '@/components/P'
import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'

import { Background } from '@/services'

export default {
  name: 'LockScreen',
  components: {
    Icon,
    Title,
    P,
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

      // Locals:
      password: null,
      error: null
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(walletStore.STORE_NAME, [
      walletStore.STATE_NAMES.isReady,
      walletStore.STATE_NAMES.networkStatus
    ])
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
  display: grid;
  justify-content: center;
  align-items: center;

  &__wrapper,
  &__form {
    min-width: 250px;
    width: 300px;
  }

  &__wrapper {
    display: grid;
    grid-template-rows: auto 60px 40px 1fr;

    padding-top: 90px;
  }

  &__form {
    display: grid;
    grid-gap: 15px;
    justify-content: center;
  }

  &__password {
    width: 250px;
  }
}
</style>
