<template>
  <Container :class="b()">
    <Input
      v-model="payload.address"
      :placeholder="placeholderAddress"
      :error="payload.error"
      round
      @input="fromZNS"
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
import { isBech32 } from '@zilliqa-js/util/dist/validation'
import { mapActions, mapState } from 'vuex'
import contactsStore from '@/store/contacts'
import uiStore from '@/store/ui'

import { EVENTS, REGX_PATTERNS } from '@/config'

import Input from '@/components/Input'
import Container from '@/components/Container'
import Button from '@/components/Button'

import { Background } from '@/services'

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
      payload: {
        address: null,
        name: null,
        error: null
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),

    placeholderAddress() {
      return `${this.local.SELECT} ${this.local.PUBLIC} ${this.local.ADDRESS} (zil1), ${this.local.OR} ZNS`
    },
    placeholderName() {
      return `${this.local.SELECT} ${this.local.NAME}.`
    }
  },
  methods: {
    ...mapActions(contactsStore.STORE_NAME, [
      contactsStore.ACTIONS_NAMES.onAddedContact
    ]),

    onAdded() {
      try {
        if (!isBech32(this.payload.address)) {
          this.payload.error = `*${this.local.INCORRECT_ADDR_FORMAT}`

          return null
        }

        this.onAddedContact(this.payload)
        this.$emit(EVENTS.close)
      } catch (err) {
        this.payload.error = err.message

        return null
      }
    },
    async fromZNS() {
      this.payload.error = null

      const regExpDomain = new RegExp(REGX_PATTERNS.domain, 'gm')

      if (regExpDomain.test(this.payload.address)) {
        try {
          const bg = new Background()
          const domain = this.payload.address

          this.payload.address = await bg.getZNSAddress(this.payload.address)
          this.payload.name = domain
        } catch (err) {
          this.payload.error = this.local.NOT_FOUND_ZNS
        }
      }
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
