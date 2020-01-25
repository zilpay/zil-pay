<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <GasControl
        :value="defaultGas"
        :DEFAULT="DEFAULT_GAS_FEE"
        @input="setGas"
      />
      <Separator />
      <RadioGroup
        :value="selectedTheme"
        :title="radioGroupThemeTitle"
        :elements="themes"
        @input="setTheme"
      >
        {{ radioGroupThemeTitle }}
      </RadioGroup>
      <Button
        :class="b('btn')"
        round
        @click="setDefaultGas"
      >
        default
      </Button>
    </Container>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

import { DEFAULT_GAS_FEE } from '../../../config/zilliqa'

import TopBar from '@/components/TopBar'
import GasControl from '@/components/GasControl'
import Container from '@/components/Container'
import RadioGroup from '@/components/RadioGroup'
import Separator from '@/components/Separator'
import Button from '@/components/Button'

export default {
  name: 'Advanced',
  components: {
    TopBar,
    GasControl,
    Container,
    Separator,
    RadioGroup,
    Button
  },
  data() {
    return {
      DEFAULT_GAS_FEE,
      radioGroupThemeTitle: 'Theme'
    }
  },
  computed: {
    ...mapState('ui', [
      'selectedTheme',
      'themes'
    ]),
    ...mapState('settings', [
      'defaultGas'
    ])
  },
  methods: {
    ...mapMutations('ui', [
      'setTheme'
    ]),
    ...mapMutations('settings', [
      'setDefaultGas',
      'setGas'
    ])
  }
}
</script>

<style lang="scss">
.Advanced {
  &__wrapper {
    display: grid;
    grid-gap: 30px;
    align-items: center;

    padding-left: 15px;
    padding-right: 15px;
  }

  &__btn {
    margin-top: 130px;
    justify-self: right;
    width: 175px;
  }
}
</style>
