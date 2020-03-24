<template>
  <div :class="b()">
    <TopBar close />
    <Container :class="b('wrapper')">
      <RadioGroup
        :value="getCurrent"
        :elements="getHours"
        @input="setLockTime"
      >
        {{ local.AUTO_LOGOUT_HOURS }} ({{ local.HOURS }})
      </RadioGroup>
      <Separator />
      <div :class="b('btns')">
        <Button
          :color="COLOR_VARIANTS.warning"
          round
          @click="onExport"
        >
          {{ local.EXPORT }}
        </Button>
        <Button
          :color="COLOR_VARIANTS.warning"
          round
          @click="onRestore"
        >
          {{ local.RESTORE }}
        </Button>
        <Button
          :disabled="Number(lockTime) === Number(DEFAULT.TIME_BEFORE_LOCK)"
          round
          @click="onDefault"
        >
          {{ local.DEFAULT }}
        </Button>
      </div>
    </Container>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import { COLOR_VARIANTS } from '@/config'
import { DEFAULT } from 'config'

import RestorePage from '@/pages/Restore'
import ExportPage from '@/pages/accounts/Export'

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
      DEFAULT
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
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
    ]),

    onDefault() {
      this.setLockTime(DEFAULT.TIME_BEFORE_LOCK)
    },
    onRestore() {
      this.$router.push({
        name: RestorePage.name
      })
    },
    onExport() {
      this.$router.push({
        name: ExportPage.name
      })
    }
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
  }
}
</style>
