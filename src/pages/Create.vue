<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <TopBar
        :class="b('nav-bar')"
        :route="false"
      />
      <Title :size="SIZE_VARIANS.md">
        {{ TITLE }}
      </Title>
      <P :variant="COLOR_VARIANTS.gray">
        {{ DESCRIPTION }}
      </P>
      <Refresh
        :class="b('reset-icon')"
        width="30"
        height="30"
        pointer
      />
      <div :class="b('words')">
        <Chip
          v-for="(el, index) of wrdsAsArray"
          :key="el.uuid"
          :circle="index + 1"
        >
          {{ el.word }}
        </Chip>
      </div>
      <Button
        :class="b('continue-btn')"
        round
      >
        CONTINUE
      </Button>
    </div>
  </div>
</template>

<script>
import {
  ICON_VARIANTS,
  SIZE_VARIANS,
  COLOR_VARIANTS
} from '@/config'
import { uuid } from 'uuidv4'

import TopBar from '@/components/TopBar'
import Chip from '@/components/Chip'
import Title from '@/components/Title'
import P from '@/components/P'
import Button from '@/components/Button'
import Refresh from '@/components/icons/Refresh'

const TITLE = 'Your recovery phrase'
const DESCRIPTION = 'Remember your 12 words.'

export default {
  name: 'Create',
  components: {
    Chip,
    TopBar,
    P,
    Title,
    Button,
    Refresh
  },
  data() {
    return {
      ICON_VARIANTS,
      SIZE_VARIANS,
      COLOR_VARIANTS,
      TITLE,
      DESCRIPTION,
      words: 'banana blind business arrest escape blame stadium display border flower daughter story'
    }
  },
  computed: {
    wrdsAsArray() {
      return this
        .words
        .split(' ')
        .map(word => ({
          word,
          uuid: uuid()
        }))
    }
  }
}
</script>

<style lang="scss">
.Create {
  display: grid;
  justify-content: center;
  align-items: center;

  &__wrapper {
    display: inline-grid;
    align-items: center;
    grid-template-rows: auto 50px 60px 50px 1fr 60px;

    width: 30vw;
  }

  &__reset-icon {
    justify-self: right;
  }

  &__words {
    display: inline-grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(6, 40px);
    grid-auto-flow: column;
    grid-column-gap: 30px;
    grid-row-gap: 10px;
  }

  &__continue-btn {
    justify-self: right;
    width: 175px;
  }

  &__nav-bar {
    width: 30vw;
  }
}
</style>
