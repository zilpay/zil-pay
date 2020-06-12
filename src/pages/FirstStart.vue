<template>
  <Container :class="b()">
    <UiPanel />
    <Icon
      :class="b('logo')"
      :icon="ICON_VARIANTS.zilPayLogo"
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
          <Plus
            height="50"
            width="50"
          />
          <P uppercase>
            {{ local.CREATE }}
          </P>
        </router-link>
        <router-link
          :class="b('btn')"
          :to="LINKS.restore"
        >
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

import Icon from '@/components/Icon'
import Title from '@/components/Title'
import P from '@/components/P'
import Container from '@/components/Container'
import UiPanel from '@/components/UiPanel'
import Plus from '@/components/icons/Plus'

export default {
  name: 'FirstStart',
  components: {
    Icon,
    Title,
    P,
    Container,
    UiPanel,
    Plus
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

    margin-top: 20%;

    background: rgba(19, 19, 19, 0.8);
    border: 2px solid var(--accent-color-primary);
    border-radius: 32px;

    transition: all 0.2s linear;

    & > * {
      color: var(--accent-color-primary);
    }

    &:hover {
      background: var(--accent-color-primary);

      & > * {
        color: var(--accent-color-black);
      }

      & > .Plus {
        border: 2px solid var(--accent-color-black);

          &:before,
          &:after {
            background-color: var(--accent-color-black);
          }
      }
    }
  }
}
</style>
