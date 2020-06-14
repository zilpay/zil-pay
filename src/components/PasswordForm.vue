<template>
  <form
    :class="b()"
    @submit.prevent="onSubmit"
  >
    <Input
      v-model="password"
      :type="INPUT_TYPES.password"
      :size="SIZE_VARIANS.sm"
      :placeholder="local.PASSWORD"
      :error="error"
      round
      autocomplete=off
      @input="onReset"
    />
    <Input
      v-model="confirmPassword"
      :type="INPUT_TYPES.password"
      :size="SIZE_VARIANS.sm"
      :error="errorConfirm"
      :placeholder="local.CONFIRM + ' ' + local.PASSWORD"
      autocomplete=off
      round
      @input="onReset"
    />
    <Button
      :class="b('btn')"
      :size="SIZE_VARIANS.md"
      :color="COLOR_VARIANTS.transparent"
      round
      uppercase
    >
      {{ btn }}
    </Button>
  </form>
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import { DEFAULT } from 'config'
import {
  EVENTS,
  REGX_PATTERNS,
  COLOR_VARIANTS,
  SIZE_VARIANS
} from '@/config'

import Button from '@/components/Button'
import Input, { INPUT_TYPES } from '@/components/Input'

/**
 * Form for validation password.
 * @param titles Array for input title.
 * @param btn Button text.
 * @event submit If from is valid than emited submit event.
 * @example
 * import PasswordForm from '@/components/PasswordForm'
 * const form = {
 *   btn: 'submit.'
 * }
 * <PasswordForm
 *   :btn="form.btn"
 *   @submit="restore"
 * />
 */
export default {
  name: 'PasswordForm',
  components: {
    Button,
    Input
  },
  props: {
    btn: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      INPUT_TYPES,
      COLOR_VARIANTS,
      SIZE_VARIANS,

      password: null,
      confirmPassword: null,
      error: null,
      errorConfirm: null
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),

    passwordTitle() {
      return `${this.local.PASSWORD}`
    }
  },
  methods: {
    onSubmit() {
      if (!this.password) {
        this.error = `*${this.local.PASSWORD} ${this.local.IS} ${this.local.REQUIRED}!`
        return null
      } else if (!new RegExp(REGX_PATTERNS).test(this.password)) {
        this.error = `*${this.local.PASSWORD} ${this.local.LOW_COMPLEXITY}`
        return null
      } else if (this.password.length < DEFAULT.MIN_LENGTH_PASSWORD) {
        this.error = `*${this.local.PASSWORD} ${this.local.MUST_LEAST}` +
                     `${DEFAULT.MIN_LENGTH_PASSWORD} ${this.local.CHARS} ${this.local.LONG}`
        return null
      } else if (this.password !== this.confirmPassword) {
        this.errorConfirm = `*${this.local.PASSWORD} ${this.local.NOT_MATCH}`
        return null
      }

      this.$emit(EVENTS.submit, this.password)
    },
    onReset() {
      this.error = null
      this.errorConfirm = null
    }
  }
}
</script>

<style lang="scss">
.PasswordForm {
  display: grid;
  grid-gap: 20px;

  width: 100%;
  max-width: 320px;

  &__btn {
    justify-self: center;
    width: 100%;
    margin-top: 20px;
  }
}
</style>
