<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <DoubleRange />
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
      >
        default
      </Button>
    </Container>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

import TopBar from '@/components/TopBar'
import DoubleRange from '@/components/DoubleRange'
import Container from '@/components/Container'
import RadioGroup from '@/components/RadioGroup'
import Separator from '@/components/Separator'
import Button from '@/components/Button'

export default {
  name: 'Advanced',
  components: {
    TopBar,
    DoubleRange,
    Container,
    Separator,
    RadioGroup,
    Button
  },
  data() {
    return {
      radioGroupThemeTitle: 'Theme'
    }
  },
  computed: {
    ...mapState('ui', [
      'selectedTheme',
      'themes'
    ])
  },
  methods: {
    ...mapMutations('ui', [
      'setTheme'
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
    justify-self: right;
    width: 175px;
  }
}
</style>
