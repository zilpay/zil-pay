<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <TopBar
        :route="false"
        back
      />
      <P :variant="COLOR_VARIANTS.gray">
        {{ DESCRIPTION }}
      </P>
      <div :class="b('words')">
        <Chip
          v-for="(phrase, index) of verifyWords"
          :key="index"
          :circle="index + 1"
          close
          @close="rm(phrase)"
        >
          {{ phrase }}
        </Chip>
      </div>
      <Button
        v-show="isContinue"
        :class="b('continue-btn')"
        :disabled="!isVerify"
        round
        block
      >
        CONTINUE
      </Button>
      <div :class="b('verify-words')">
        <Chip
          v-for="(phrase, index) of exceptionalItems"
          :key="index"
          pointer
          @click="add(phrase)"
        >
          {{ phrase }}
        </Chip>
      </div>
    </div>
    <Wave />
  </div>
</template>

<script>
const { Set } = global

import {
  SIZE_VARIANS,
  COLOR_VARIANTS
} from '@/config'

import Home from '@/pages/Home'

import TopBar from '@/components/TopBar'
import Chip from '@/components/Chip'
import P from '@/components/P'
import { shuffle } from '../../lib/utils'
import Button from '@/components/Button'
import Wave from '@/components/Wave'

const DESCRIPTION = 'Verify your recovery phrase'

export default {
  name: 'Verify',
  components: {
    TopBar,
    P,
    Chip,
    Button,
    Wave
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      DESCRIPTION,
      words: 'banana blind business arrest escape blame stadium display border flower daughter story',
      verifyWords: [],
      randomItems: []
    }
  },
  computed: {
    /**
     * Divide the array.
     */
    exceptionalItems() {
      return this.randomItems.filter(
        word => !this.verifyWords.includes(word)
      )
    },
    /**
     * Tessting for original seed phrase.
     */
    isVerify() {
      return this.words === this.verifyWords.join(' ')
    },
    /**
     * If Seed is true then can continue.
     */
    isContinue() {
      if (this.verifyWords.length < 12) {
        return false
      } else if (this.exceptionalItems.length > 0) {
        return false
      }

      return true
    }
  },
  methods: {
    shuffle,
    /**
     * Added phrase to verifyWords Set array.
     */
    add(phrase) {
      const uniqueItems = new Set(this.verifyWords)

      if (phrase && this.randomItems.includes(phrase)) {
        uniqueItems.add(phrase)
      }

      this.verifyWords = Array.from(uniqueItems)
    },
    /**
     * Remove phrase from verifyWords Set array.
     */
    rm(phraseRM) {
      this.verifyWords = this.verifyWords.filter(
        phrase => phrase !== phraseRM
      )
    },
    continue() {
      this.$router.push({ name: Home.name })
    }
  },
  mounted() {
    const words = this.words.split(' ')

    this.randomItems = this.shuffle(words)
  }
}
</script>

<style lang="scss">
.Verify {
  display: grid;
  justify-content: center;
  align-items: center;

  &__wrapper {
    display: inline-grid;
    align-items: center;
    grid-template-rows: auto 60px 1fr 90px minmax(200px, 1fr);

    min-width: 250px;
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
    max-width: 175px;
    justify-self: right;
  }

  &__verify-words {
    display: inline-grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 15px;
    grid-row: 5;
  }
}
</style>
