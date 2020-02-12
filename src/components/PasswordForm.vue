<template>
  <form
    :class="b()"
    @submit.prevent="onSubmit"
  >
    <Input
      v-model="password"
      :type="INPUT_TYPES.password"
      :title="titles[0]"
      :error="error"
      round
      autocomplete=off
      @input="onReset"
    />
    <Input
      v-model="confirmPassword"
      :type="INPUT_TYPES.password"
      :title="titles[1]"
      :error="errorConfirm"
      autocomplete=off
      round
      @input="onReset"
    />
    <Button
      :class="b('btn')"
      :size="SIZE_VARIANS.xs"
      :color="COLOR_VARIANTS.warning"
      round
    >
      {{ btn }}
    </Button>
  </form>
</template>

<script>
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
 *   titles: [
 *     'Password (min 8 chars)',
 *     'Confirm Password.'
 *   ],
 *   btn: 'submit.'
 * }
 * <PasswordForm
 *   :titles="form.titles"
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
    titles: {
      type: Array,
      required: true
    },
    btn: {
      type: String,
      required: true
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
  methods: {
    onSubmit() {
      if (!this.password) {
        this.error = '*Password is required!'
        return null
      } else if (!new RegExp(REGX_PATTERNS).test(this.password)) {
        this.error = '*Passwords low complexity.'
        return null
      } else if (this.password.length < 8) {
        this.error = '*Passwords must be at least 8 characters long.'
        return null
      } else if (this.password !== this.confirmPassword) {
        this.errorConfirm = '*Passwords do not match. Please try again'
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
  grid-gap: 15px;
  max-width: 250px;
}
</style>
