<template>
  <div :class="b()">
    <Container :class="b('wrapper')">
      <TopBar
        :route="false"
        back
      />
      <Title>
        {{ TITLE }}
      </Title>
      <P :class="b('description')">
        {{ DESCRIPTION }}
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
    <Wave />
  </div>
</template>

<script>
import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'

import Title from '@/components/Title'
import TopBar from '@/components/TopBar'
import P from '@/components/P'
import Button from '@/components/Button'
import Input, { INPUT_TYPES } from '@/components/Input'
import Container from '@/components/Container'
import Wave from '@/components/Wave'

const TITLE = 'Restore your Account.'
const DESCRIPTION = 'Enter your secret word phrase here to restore your vault.'

export default {
  name: 'Restore',
  components: {
    Title,
    P,
    Container,
    Input,
    Button,
    Wave,
    TopBar
  },
  data() {
    return {
      COLOR_VARIANTS,
      SIZE_VARIANS,
      INPUT_TYPES,
      TITLE,
      DESCRIPTION,
      seed: null,
      password: null,
      confirmPassword: null
    }
  },
  methods: {
    restore() {
      // console.log(
      //   this.seed,
      //   this.password,
      //   this.confirmPassword
      // )
    }
  }
}
</script>

<style lang="scss">
.Restore {
  &__wrapper {
    display: grid;

    padding-top: 10vh;

    justify-content: center;
  }

  &__description {
    opacity: 0.5;
  }

  &__seed-input {
    display: inline-block;

    width: 250px;
    height: 100px;

    padding: 15px;

    border: 0;
    border-radius: var(--default-border-radius);
    font-size: var(--size-sm-font);
    color: var(--theme-color-font);
    background-color: var(--theme-color-input);

    outline: none;
    resize: none;
    overflow: hidden;
  }

  &__restore-form {
    display: grid;
    grid-template-rows: 150px 80px 80px;

    max-width: 250px;

    padding-top: 30px;
  }

  &__submit-btn {
    width: 175px;
  }
}
</style>
