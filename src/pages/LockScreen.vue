<template>
  <div :class="b()">
    <Icon
      :class="b('logo')"
      :icon="icons.zilliqaLogo"
      width="106"
      height="144"
    />
    <Title :class="b('title')">
      Zilliqa
    </Title>
    <P
      :class="b('greeting')"
      :font="fonts.regular"
    >
      Welcome back
    </P>
    <form
      :class="b('form')"
      @submit.prevent="unlock"
    >
      <Input
        :class="b('form-password')"
        :type="inputTypes.password"
        :size="sizes.sm"
        placeholder="Password"
        required
        autofocus
      />
      <Button :size="sizes.sm">
        CONTINUE
      </Button>
    </form>
  </div>
</template>

<script>
import {
  ICON_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS
} from '@/config'

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
    Button
  },
  data() {
    return {
      icons: ICON_VARIANTS,
      fonts: FONT_VARIANTS,
      sizes: SIZE_VARIANS,
      inputTypes: INPUT_TYPES
    }
  },
  methods: {
    unlock() {
      console.log('unlock')
    }
  }
}
</script>

<style lang="scss">
.LockScreen {
  display: grid;

  grid-template-rows: 1fr 23px 90px 1fr;
  grid-template-columns: auto;

  grid-template-areas: "logo"
                       "title"
                       "greeting"
                       "form";
  padding-top: 91px;
  padding-left: 40px;
  padding-right: 40px;

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

  &__form-password {
    text-align: center;
  }
}
</style>
