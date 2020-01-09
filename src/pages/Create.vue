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
      <div :class="b('words')">
        <Chip
          v-for="(el, index) of wrdsAsArray"
          :key="el.uuid"
          :circle="index + 1"
        >
          {{ el.word }}
        </Chip>
      </div>
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

const TITLE = 'Your recovery phrase'
const DESCRIPTION = 'Remember your 12 words.'

export default {
  name: 'Create',
  components: {
    Chip,
    TopBar,
    P,
    Title
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
    display: grid;

    width: 30vw;
  }

  &__nav-bar {
    width: 30vw;
  }
}
</style>
