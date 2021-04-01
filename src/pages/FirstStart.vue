<template>
  <div :class="b()">
    <UiPanel />
    <header>
      <div id="intro">
        <Title :variant="COLOR_VARIANTS.primary">
          {{ local.FIRSTSTART_TITLE }}
        </Title>
        <P :variant="COLOR_VARIANTS.primary">
          {{ local.FIRSTSTART_DIS }}
        </P>
      </div>
    </header>

    <div :class="b('actions')">
      <router-link
        :class="b('btn')"
        :to="LINKS.create"
      >
        <SvgInject
          :variant="ICON_VARIANTS.add"
          height="88"
          width="88"
        />
        <P uppercase>
          {{ local.CREATE }}
        </P>
      </router-link>
      <router-link
        :class="b('btn', { cloud: true })"
        :to="LINKS.restore"
      >
        <SvgInject
          :variant="ICON_VARIANTS.cloud"
          height="88"
          width="88"
        />
        <P uppercase>
          {{ local.RESTORE }}
        </P>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import {
  ICON_VARIANTS,
  SIZE_VARIANS,
  COLOR_VARIANTS
} from '@/config'

import CreateAcc from '@/pages/Create'
import Restore from '@/pages/Restore'

import Title from '@/components/Title'
import P from '@/components/P'
import UiPanel from '@/components/UiPanel'
import SvgInject from '@/components/SvgInject'

export default {
  name: 'FirstStart',
  components: {
    Title,
    P,
    UiPanel,
    SvgInject
  },
  data() {
    return {
      // Proxy constants:
      ICON_VARIANTS,
      SIZE_VARIANS,
      COLOR_VARIANTS,
      LINKS: {
        restore: Restore.name,
        create: CreateAcc.name
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
  }
}
</script>

<style lang="scss">
.FirstStart {
  display: flex;
  flex-direction: column;

  &__actions {
    display: flex;
    justify-content: space-around;
  }

  &__btn {
    padding: 20px;

    & > * {
      color: var(--accent-color-primary);
    }

    & > svg {
      margin-bottom: 15px;
    }

    &:hover {
      background: var(--accent-color-primary);
      box-shadow: 1px 0 7px var(--accent-color-primary);

      & > * {
        color: var(--app-background-color);
      }

      & > svg > path {
        fill: var(--app-background-color);
      }
    }

    .P {
      text-align: center;
    }
  }
}
</style>
