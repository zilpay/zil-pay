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
        @submit.prevent="unlock"
      >
        <Input
          v-model="password"
          :type="INPUT_TYPES.password"
          :size="SIZE_VARIANS.xs"
          :placeholder="local.PASSWORD"
          minlength="6"
          block
          round
          centred
          required
          autofocus
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
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import {
  ICON_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS,
  REGX_PATTERNS
} from '@/config'

import Home from '@/pages/Home'

import Container from '@/components/Container'
import Icon from '@/components/Icon'
import Title from '@/components/Title'
import P from '@/components/P'
import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'

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
      REGX_PATTERNS,

      // Locals:
      password: null
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
  },
  methods: {
    unlock() {
      this.$router.push({ name: Home.name })
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
  }

  &__wrapper {
    display: grid;
    grid-template-rows: auto 60px 40px 1fr;

    padding-top: 90px;
  }

  &__form {
    display: grid;
    grid-gap: 11px;
    justify-self: center;
  }
}
</style>
