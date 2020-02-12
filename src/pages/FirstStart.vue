<template>
  <Container :class="b()">
    <UiPanel />
    <div :class="b('wrapper')">
      <Icon
        :icon="icons.zilPayLogo"
        width="148"
        height="148"
      />
      <Title>
        Welcome to ZilPay
      </Title>
      <P>
        Connecting you to Zilliqa and
        the Decentralized Web. We’re happy to see you.
      </P>
      <div :class="b('actions')">
        <div
          v-for="action of actions"
          :key="action.uuid"
          :class="b('action')"
        >
          <Icon
            :icon="action.icon"
            width="80"
            height="80"
          />
          <Button
            :size="sizes.xs"
            :color="action.color"
            block
            round
            @click="$router.push({ name: action.toLink })"
          >
            {{ action.name }}
          </Button>
        </div>
      </div>
    </div>
    <Wave />
  </Container>
</template>

<script>
import { uuid } from 'uuidv4'

import {
  ICON_VARIANTS,
  SIZE_VARIANS,
  COLOR_VARIANTS
} from '@/config'

import Icon from '@/components/Icon'
import Title from '@/components/Title'
import P from '@/components/P'
import Button from '@/components/Button'
import Container from '@/components/Container'
import CreateAcc from '@/pages/Create'
import Restore from '@/pages/Restore'
import Wave from '@/components/Wave'
import UiPanel from '@/components/UiPanel'

export default {
  name: 'FirstStart',
  components: {
    Icon,
    Title,
    P,
    Button,
    Container,
    Wave,
    UiPanel
  },
  data() {
    return {
      // Proxy constants:
      icons: ICON_VARIANTS,
      sizes: SIZE_VARIANS,

      // Local variables.
      actions: [
        {
          uuid: uuid(),
          name: 'CREATE',
          icon: ICON_VARIANTS.add,
          toLink: CreateAcc.name,
          color: COLOR_VARIANTS.success
        },
        {
          uuid: uuid(),
          name: 'RESTORE',
          icon: ICON_VARIANTS.download,
          toLink: Restore.name,
          color: COLOR_VARIANTS.primary
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.FirstStart {
  display: grid;

  justify-content: center;
  align-items: center;

  height: 70vh;

  &__wrapper {
    display: grid;
    grid-gap: 30px;

    justify-items: center;
    text-align: center;
  }

  &__actions {
    display: flex;

    flex-wrap: wrap;
    justify-content: space-around;

    width: 100%;
  }

  &__action {
    display: grid;
    grid-gap: 15px;

    justify-items: center;

    min-width: 175px;
  }

  &__wave {
    position: fixed;
    z-index: -1;
    bottom: 0;

    width: 100%;
    max-width: 100vw;
  }
}
</style>
