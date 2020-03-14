<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <RadioGroup
        :value="currency"
        :title="local.CUR_CONVER"
        :elements="currencyItems"
        @input="setCurrency"
      >
        {{ local.CUR_CONVER }}:
      </RadioGroup>
      <Separator />
      <RadioGroup
        :value="addressFormat"
        :title="local.ADDR_FORMATS"
        :elements="addressFormatItems"
        @input="setAddressFormat"
      >
        {{ local.ADDR_FORMATS }}:
      </RadioGroup>
      <div :class="b('btns')">
        <Button
          :color="COLOR_VARIANTS.warning"
          :disabled="Object.keys(transactions).length === 0"
          round
          @click="setClearTxHistory"
        >
          {{ local.CLEAR }} {{ local.HISTORY }}
        </Button>
        <Button round>
          {{ local.DEFAULT }}
        </Button>
      </div>
    </Container>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import transactionsStore from '@/store/transactions'

import { COLOR_VARIANTS } from '@/config'

import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import Separator from '@/components/Separator'
import RadioGroup from '@/components/RadioGroup'
import Button from '@/components/Button'

export default {
  name: 'General',
  components: {
    TopBar,
    RadioGroup,
    Container,
    Separator,
    Button
  },
  data() {
    return {
      COLOR_VARIANTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.currencyItems,
      settingsStore.STATE_NAMES.currency,
      settingsStore.STATE_NAMES.addressFormatItems,
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapState(transactionsStore.STORE_NAME, [
      transactionsStore.STATE_NAMES.transactions
    ])
  },
  methods: {
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setCurrency,
      settingsStore.MUTATIONS_NAMES.setAddressFormat
    ]),
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setClearTxHistory
    ])
  }
}
</script>

<style lang="scss">
.General {
  &__wrapper {
    display: grid;
    grid-gap: 30px;
    align-items: center;

    padding-left: 15px;
    padding-right: 15px;
  }

  &__btns {
    display: grid;
    justify-self: right;
    grid-gap: 15px;

    width: 175px;
  }
}
</style>
