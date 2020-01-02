<template>
  <div :class="b()">
    <Container :class="b('wrapper')">
      <Title>
        Restore your Account.
      </Title>
      <P>
        Enter your secret word phrase here to restore your vault.
      </P>
      <form
        :class="b('restore-form')"
        @submit.prevent="restore"
      >
        <textarea
          v-model="seed"
          :class="b('seed-input')"
        />
        <Input
          v-model="password"
          :type="INPUT_TYPES.password"
          title="Password (min 8 chars)"
        />
        <Input
          v-model="confirmPassword"
          :type="INPUT_TYPES.password"
          title="Confirm Password."
        />
        <Button
          :class="b('submit-btn')"
          :size="SIZE_VARIANS.xs"
          :color="COLOR_VARIANTS.warning"
          round
        >
          Restore.
        </Button>
      </form>
    </Container>
    <img
      :class="b('wave')"
      src="/illustrations/wave.svg"
    >
  </div>
</template>

<script>
import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'

import Title from '@/components/Title'
import P from '@/components/P'
import Button from '@/components/Button'
import Input, { INPUT_TYPES } from '@/components/Input'
import Container from '@/components/Container'

export default {
  name: 'Restore',
  components: {
    Title,
    P,
    Container,
    Input,
    Button
  },
  data() {
    return {
      COLOR_VARIANTS,
      SIZE_VARIANS,
      INPUT_TYPES,
      seed: null,
      password: null,
      confirmPassword: null
    }
  },
  methods: {
    restore() {
      console.log(
        this.seed,
        this.password,
        this.confirmPassword
      )
    }
  }
}
</script>

<style lang="scss">
.Restore {
  &__wrapper {
    display: grid;

    padding-top: 10%;

    justify-content: center;
  }

  &__seed-input {
    display: inline-block;

    width: 320px;
    height: 100px;

    border: 0;
    border-radius: var(--default-border-radius);
    font-size: var(--size-sm-font);
    background-color: var(--accent-color-gray);

    outline: none;
    resize: none;
    overflow: hidden;
  }

  &__restore-form {
    display: grid;

    grid-template-rows: 130px 80px 80px;

    max-width: 320px;

    padding-top: 30px;
  }

  &__submit-btn {
    width: 175px;
  }

  &__wave {
    position: fixed;
    z-index: -1;
    bottom: 0;

    width: 100%;
    max-width: 100vw;
  }
}
</style>
