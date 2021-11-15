<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <div>
        <P>
          {{ local.IMPORT_HW }}:
        </P>
        <Input
          v-model="ledger.index"
          :error="ledger.error"
          :placeholder="local.WALLET_ID"
          :type="INPUT_TYPES.number"
          round
          @input="ledger.error = null"
        />
      </div>
      <Button
        :color="COLOR_VARIANTS.negative"
        block
        round
        @click="onLedger"
      >
        CONNECT
      </Button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import accountsStore from '@/store/accounts'

import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  FONT_VARIANTS
} from '@/config'

import homePage from '@/pages/Home'

import P from '@/components/P'
import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'

import { ledgerImportAccount } from '@/services'

export default {
  name: 'LedgerConnect',
  components: {
    P,
    Button,
    Input
  },
  data() {
    return {
      SIZE_VARIANS,
      INPUT_TYPES,
      COLOR_VARIANTS,
      FONT_VARIANTS,

      ledger: {
        index: 0,
        error: null
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
  },
  methods: {
    ...mapActions(accountsStore.STORE_NAME, [
      accountsStore.ACTIONS_NAMES.onAddAccount
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
    /**
     * When import type is ledger hardware wallet.
     */
    async onLedger() {
      this.ledger.error = null
      this.setLoad()
      try {
        const result = await ledgerImportAccount(this.ledger.index)

        await this.onAddAccount(result)

        this.$router.push({ name: homePage.name })
      } catch (err) {
        this.ledger.error = err
        // Denied or any errors.
      } finally {
        this.setLoad()
      }
    }
  }
}
</script>

<style lang="scss">
.LedgerConnect {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 90%;
    min-height: 340px;

    & > .Button {
      margin: 14px;
      min-width: 250px;
    }
  }
}
</style>
