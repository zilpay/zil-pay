<template>
  <div :class="b()">
    <UiPanel />
    <div :class="b('wrapper')">
      <TopBar
        :route="false"
        back
      />
      <P :variant="COLOR_VARIANTS.gray">
        {{ local.VERIFY_DIS }}
      </P>
      <div :class="b('words')">
        <Chip
          v-for="(phrase, index) of verifyWords"
          :key="index"
          :circle="index + 1"
          :color="colorChip"
          close
          @close="rm(phrase)"
        >
          {{ phrase }}
        </Chip>
      </div>
      <PasswordForm
        v-show="isVerify"
        :btn="local.CONTINUE"
        @submit="onSubmit"
      />
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
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'

import { SIZE_VARIANS, COLOR_VARIANTS } from '@/config'
import { shuffle } from 'lib/utils/shuffle'

import TopBar from '@/components/TopBar'
import Chip from '@/components/Chip'
import P from '@/components/P'
import Wave from '@/components/Wave'
import PasswordForm from '@/components/PasswordForm'
import UiPanel from '@/components/UiPanel'

import { Background } from '@/services'

const { window, Set } = global
const bgScript = new Background()

export default {
  name: 'Verify',
  components: {
    TopBar,
    P,
    Chip,
    Wave,
    PasswordForm,
    UiPanel
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,

      verifyWords: [],
      randomItems: []
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(walletStore.STORE_NAME, [
      walletStore.STATE_NAMES.verifly
    ]),
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
      return this.verifly === this.verifyWords.join(' ')
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
    },
    colorChip() {
      if (this.exceptionalItems.length > 0) {
        return COLOR_VARIANTS.info
      }

      return this.isVerify ? COLOR_VARIANTS.success : COLOR_VARIANTS.danger
    }
  },
  methods: {
    shuffle,
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),
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
    async onSubmit(password) {
      this.setLoad()
      await bgScript.createWallet({
        password,
        seed: this.verifyWords.join(' ')
      })

      window.location.reload()
    }
  },
  mounted() {
    const words = this.verifly.split(' ')

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
    display: flex;
    flex-direction: column;
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
