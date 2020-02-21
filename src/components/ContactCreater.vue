<template>
  <Container :class="b()">
    <Input
      v-model="payload.address"
      :placeholder="placeholderAddress"
      round
    />
    <Input
      v-model="payload.name"
      :placeholder="placeholderName"
      round
    />
    <Button
      :class="b('btn')"
      block
      round
      @click="onAdded"
    >
      Create
    </Button>
  </Container>
</template>

<script>
import { mapActions } from 'vuex'

import { DEFAULT } from 'config/default'
import { EVENTS } from '@/config'

import Input from '@/components/Input'
import Container from '@/components/Container'
import Button from '@/components/Button'

/**
 * Contact form creater.
 * @event close Emited when contacts was created.
 * @example
 * import ContactCreater from '@/components/ContactCreater'
 * <ContactCreater @close="/ do something /" />
 */
export default {
  name: 'ContactCreater',
  components: {
    Input,
    Container,
    Button
  },
  data() {
    return {
      placeholderAddress: 'Select, public address (zil1), or ZNS',
      placeholderName: `Select name(${DEFAULT.MAX_LENGTH_NAME} Length)`,
      payload: {
        address: null,
        name: null
      }
    }
  },
  methods: {
    ...mapActions('contacts', [
      'onAddedContact'
    ]),

    onAdded() {
      this.onAddedContact(this.payload)
      this.$emit(EVENTS.close)
    }
  }
}
</script>

<style lang="scss">
.ContactCreater {
  display: grid;
  grid-gap: 15px;

  /* top | right | bottom | left */
  padding: 15px;

  &__btn {
    max-width: 150px;
  }
}
</style>
