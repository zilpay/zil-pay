<template>
  <Container :class="b()">
    <UiPanel />
    <SvgInject
      :class="b('logo')"
      :variant="ICON_VARIANTS.zilPayLogo"
    />
    <div :class="b('wrapper')">
      <Container>
        <Title>
          {{ local.FIRSTSTART_TITLE }}
        </Title>
        <P>
          {{ local.FIRSTSTART_DIS }}
        </P>
      </Container>
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
  </Container>
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import {
  ICON_VARIANTS,
  SIZE_VARIANS
} from '@/config'

import CreateAcc from '@/pages/Create'
import Restore from '@/pages/Restore'

import Title from '@/components/Title'
import P from '@/components/P'
import Container from '@/components/Container'
import UiPanel from '@/components/UiPanel'
import SvgInject from '@/components/SvgInject'

export default {
  name: 'FirstStart',
  components: {
    Title,
    P,
    Container,
    UiPanel,
    SvgInject
  },
  data() {
    return {
      // Proxy constants:
      ICON_VARIANTS,
      SIZE_VARIANS,
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
  justify-content: center;
  align-items: center;

  text-align: center;

  background-color: var(--app-background-color);

  &__logo {
    position: absolute;

    width: 50vw;
    height: 50vh;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;

    height: 70vh;
    width: 1024px;
    z-index: 1;
  }

  &__actions {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
  }

  &__btn {
    display: flex;
    flex-direction: column;
    justify-content: inherit;
    align-items: center;

    min-width: 200px;
    min-height: 200px;

    margin-top: 10%;

    background: var(--opacity-bg-element);
    border: 2px solid var(--accent-color-primary);
    border-radius: 32px;

    & > * {
      color: var(--accent-color-primary);
    }

    &:hover {
      background: var(--accent-color-primary);

      & > * {
        color: var(--accent-color-black);
      }

      & > svg > path {
        fill: var(--accent-color-black);
      }
    }
  }
}
</style>
