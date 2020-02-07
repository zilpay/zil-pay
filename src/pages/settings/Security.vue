<template>
  <div :class="b()">
    <TopBar close />
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
      <div :class="b('btns')">
        <Button
          :color="COLOR_VARIANTS.warning"
          round
        >
          RESET
        </Button>
        <Button
          :color="COLOR_VARIANTS.warning"
          round
        >
          RESTORE
        </Button>
        <Button round>
          default
        </Button>
      </div>
    </Container>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'

import { COLOR_VARIANTS } from '@/config'

import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import Separator from '@/components/Separator'
import RadioGroup from '@/components/RadioGroup'
import Button from '@/components/Button'

export default {
  name: 'Security',
  components: {
    TopBar,
    Container,
    Separator,
    RadioGroup,
    Button
  },
  data() {
    return {
      COLOR_VARIANTS,
      autoLogoutTimerTitle: 'Auto-Logout Timer (hours)'
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.lockTime
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getHours,
      settingsStore.GETTERS_NAMES.getCurrent
    ])
  },
  methods: {
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setLockTime
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

  &__btns {
    display: grid;
    justify-self: right;
    grid-gap: 15px;
    width: 175px;

    margin-top: 120px;
  }
}
</style>
