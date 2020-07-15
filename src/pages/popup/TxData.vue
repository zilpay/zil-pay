<template>
  <div :class="b()">
    <TopBar />
    <div :class="b('wrapper')">
      <div :class="b('switcher')">
        <P capitalize>
          {{ local.CAN_EDIT }}
        </P>
        <SwitchBox v-model="options.modifiable"/>
      </div>
      <tree-view
        :data="data"
        :options="options"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import transactionsStore from '@/store/transactions'
import uiStore from '@/store/ui'

import { SIZE_VARIANS, FONT_VARIANTS } from '@/config'

import TopBar from '@/components/TopBar'
import P from '@/components/P'
import SwitchBox from '@/components/SwitchBox'

export default {
  name: 'Data',
  components: {
    TopBar,
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
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__wrapper {
    width: 100%;
    max-width: 290px;
  }

  &__switcher {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    & > .SwitchBox {
      margin-left: 15px;
    }
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
