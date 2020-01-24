<template>
  <div :class="b()">
    <TopBar />
    <Container :class="b('wrapper')">
      <RadioGroup
        :value="getCurrent"
        :title="autoLogoutTimerTitle"
        :elements="getHours"
        @input="setLockTime"
      >
        {{ autoLogoutTimerTitle }}
      </RadioGroup>
      <Separator />
    </Container>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import Separator from '@/components/Separator'
import RadioGroup from '@/components/RadioGroup'

export default {
  name: 'Security',
  components: {
    TopBar,
    Container,
    Separator,
    RadioGroup
  },
  data() {
    return {
      autoLogoutTimerTitle: 'Auto-Logout Timer (hours)'
    }
  },
  computed: {
    ...mapState('settings', [
      'lockTime'
    ]),
    ...mapGetters('settings', [
      'getHours',
      'getCurrent'
    ])
  },
  methods: {
    ...mapMutations('settings', [
      'setLockTime'
    ])
  }
}
</script>

<style lang="scss">
.Security {
  &__wrapper {
    display: grid;
    grid-gap: 30px;
    align-items: center;

    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>
