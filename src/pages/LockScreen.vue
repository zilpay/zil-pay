<template>
  <div :class="b()">
    <Container :class="b('wrapper')">
      <Icon
        :class="b('logo')"
        :icon="ICON_VARIANTS.zilliqaLogo"
        width="106"
        height="144"
      />
      <Title :class="b('title')">
        Zilliqa
      </Title>
      <P
        :class="b('greeting')"
        :font="FONT_VARIANTS.regular"
      >
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
  SIZE_VARIANS
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
  padding-top: 90px;

  &__wrapper,
  &__form {
    min-width: 250px;
  }

  &__wrapper {
    display: grid;
    grid-template-areas: "logo"
                         "title"
                         "greeting"
                         "form";
  }

  &__logo {
    grid-area: logo;
  }

  &__title {
    grid-area: title;
  }

  &__greeting {
    grid-area: greeting;
  }

  &__form {
    display: grid;
    grid-gap: 11px;
    grid-area: form;
    justify-self: center;
    grid-template-columns: 1fr;
  }
}
</style>
