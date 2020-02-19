<template>
  <div :class="b()">
    <TopBar />
    <Container :class="b('wrapper')">
      <div :class="b('switcher')">
        <P>
          {{ local.CAN_EDIT }}
        </P>
        <SwitchBox v-model="options.modifiable"/>
      </div>
      <tree-view
        :data="data"
        :options="options"
      />
    </Container>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import transactionsStore from '@/store/transactions'
import uiStore from '@/store/ui'

import { SIZE_VARIANS, FONT_VARIANTS } from '@/config'

import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import P from '@/components/P'
import SwitchBox from '@/components/SwitchBox'

export default {
  name: 'Data',
  components: {
    TopBar,
    Container,
    P,
    SwitchBox
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,

      options: {
        maxDepth: 2,
        rootObjectKey: 'data',
        modifiable: false,
        link: false,
        limitRenderDepth: false
      }
    }
  },
  computed: {
    ...mapGetters(transactionsStore.STORE_NAME, [
      transactionsStore.GETTERS_NAMES.getCurrent
    ]),
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),

    data() {
      return JSON.parse(this.getCurrent.data)
    }
  }
}
</script>

<style lang="scss">
.Data {
  &__wrapper {
    display: grid;
    grid-gap: 15px;

    padding-top: 30px;
    padding-left: 15px;
    padding-right: 15px;
  }

  &__switcher {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 150px;

    justify-self: right;
  }
}

.tree-view-item-value {
  border: 0;
  background: transparent;
  width: fit-content;
}

.tree-view-item-node {
  color: var(--theme-color-font);
  font-family: var(--font-family-medium);
}
.tree-view-item-key,
.tree-view-item-value {
  color: var(--theme-color-font);
  font-family: var(--font-family-light);
}
</style>
