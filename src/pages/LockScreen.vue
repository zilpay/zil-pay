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
        Welcome back
      </P>
      <form
        :class="b('form')"
        @submit.prevent="unlock"
      >
        <Input
          v-model="password"
          :type="INPUT_TYPES.password"
          :size="SIZE_VARIANS.xs"
          minlength="6"
          placeholder="Password"
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
          CONTINUE
        </Button>
      </form>
    </Container>
  </div>
</template>

<script>
import {
  ICON_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS,
  REGX_PATTERNS
} from '@/config'

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
  methods: {
    unlock() {
      // console.log('unlock', this.password)
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
