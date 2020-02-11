<template>
  <div :class="b()">
    <TopBar
      :route="false"
      back
    />
    <Container :class="b('wrapper')">
      <Title>
        {{ TITLE }}
      </Title>
      <P :class="b('description')">
        {{ DESCRIPTION }}
      </P>
      <div>
        <textarea
          v-model="seed"
          :class="b('seed-input')"
        />
        <PasswordForm
          :titles="form.titles"
          :btn="form.btn"
          @submit="restore"
        />
      </div>
    </Container>
    <Wave />
  </div>
</template>

<script>
import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'

import Title from '@/components/Title'
import TopBar from '@/components/TopBar'
import P from '@/components/P'
import Container from '@/components/Container'
import Wave from '@/components/Wave'
import PasswordForm from '@/components/PasswordForm'

const TITLE = 'Restore your Account.'
const DESCRIPTION = 'Enter your secret word phrase here to restore your vault.'

export default {
  name: 'Restore',
  components: {
    Title,
    P,
    Container,
    Wave,
    TopBar,
    PasswordForm
  },
  data() {
    return {
      COLOR_VARIANTS,
      SIZE_VARIANS,
      TITLE,
      DESCRIPTION,

      seed: null,
      form: {
        titles: [
          'Password (min 8 chars)',
          'Confirm Password.'
        ],
        btn: 'Restore.'
      }
    }
  },
  methods: {
    restore(event) {
      console.log(event)
    }
  }
}
</script>

<style lang="scss">
.Restore {
  display: grid;
  justify-content: center;
  align-items: center;

  &__wrapper {
    padding-top: 30px;
    padding-right: 15px;
    padding-left: 15px;
  }

  &__description {
    padding-top: 30px;
    opacity: 0.5;
  }

  &__seed-input {
    display: inline-block;

    width: 235px;
    height: 100px;

    margin-top: 15px;

    padding-left: 15px;
    padding-top: 15px;

    border: 0;
    border-radius: var(--default-border-radius);
    font-size: var(--size-sm-font);
    color: var(--theme-color-font);
    background-color: var(--theme-color-input);

    outline: none;
    resize: none;
    overflow: hidden;
  }
}
</style>
