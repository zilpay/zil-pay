<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <RadioGroup
        :value="network"
        :title="local.NETWORKS"
        :elements="networkConfig | keys"
        @input="setNetwork"
      >
        {{ local.NETWORKS }}:
      </RadioGroup>
      <Separator />
      <div>
        <Input
          :value="node.PROVIDER"
          title="Node."
          round
        />
        <Input
          :value="node.MSG_VERSION"
          title="MSG"
          round
        />
      </div>
      <Button
        :class="b('btn')"
        round
      >
        {{ local.DEFAULT }}
      </Button>
    </Container>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import RadioGroup from '@/components/RadioGroup'
import Separator from '@/components/Separator'
import Input from '@/components/Input'
import Button from '@/components/Button'

import { keys } from '@/filters'

export default {
  name: 'Networks',
  components: {
    TopBar,
    Container,
    RadioGroup,
    Separator,
    Input,
    Button
  },
  filters: { keys },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.networkConfig,
      settingsStore.STATE_NAMES.network
    ]),

    node() {
      return this.networkConfig[this.network]
    }
  },
  methods: {
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setNetwork
    ])
  }
}
</script>

<style lang="scss">
.Networks {
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

    margin-top: 30px;
  }
}
</style>
