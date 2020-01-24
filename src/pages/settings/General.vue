<template>
  <div :class="b()">
    <TopBar />
    <Container :class="b('wrapper')">
      <RadioGroup
        :value="currency"
        :title="currencyTitle"
        :elements="currencyItems"
        @input="setCurrency"
      >
        {{ currencyTitle }}
      </RadioGroup>
      <Separator />
      <RadioGroup
        :value="addressFormat"
        :title="addressFormatTitle"
        :elements="addressFormatItems"
        @input="setAddressFormat"
      >
        {{ addressFormatTitle }}
      </RadioGroup>
      <div :class="b('btns')">
        <Button
          :color="COLOR_VARIANTS.warning"
          round
        >
          Clear tx history
        </Button>
        <Button round>
          Default
        </Button>
      </div>
    </Container>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

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
      COLOR_VARIANTS,
      currencyTitle: 'Currency conversion:',
      addressFormatTitle: 'Address formats:'
    }
  },
  computed: {
    ...mapState('settings', [
      'currencyItems',
      'currency',
      'addressFormatItems',
      'addressFormat'
    ])
  },
  methods: {
    ...mapMutations('settings', [
      'setCurrency',
      'setAddressFormat'
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
