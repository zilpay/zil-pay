<template>
  <div :class="b()">
    <UiPanel />
    <SvgInject
      :class="b('logo')"
      :variant="ICON_VARIANTS.zilPayLogo"
    />
    <div :class="b('wrapper')">
      <Title :size="SIZE_VARIANS.lg">
        {{ local.VERIFY_DIS }}
      </Title>
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
        <Chip
          v-for="(phrase, index) of Array(randomItems.length - verifyWords.length)"
          :key="index + 'emnty'"
        />
      </div>
      <PasswordForm
        v-show="isVerify"
        :btn="local.CONTINUE"
        @submit="onSubmit"
      />
      <P
        v-show="!isVerify"
        :class="b('intr')"
        :size="SIZE_VARIANS.md"
      >
        {{ local.VERIFY_PICK }}
      </P>
      <div :class="b('words')">
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
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'

import { SIZE_VARIANS, COLOR_VARIANTS, ICON_VARIANTS } from '@/config'
import { shuffle } from 'lib/utils/shuffle'

import Chip from '@/components/Chip'
import Title from '@/components/Title'
import P from '@/components/P'
import PasswordForm from '@/components/PasswordForm'
import UiPanel from '@/components/UiPanel'
import SvgInject from '@/components/SvgInject'

import { Background } from '@/services'

const { window, Set } = global
const bgScript = new Background()

export default {
  name: 'Verify',
  components: {
    Chip,
    Title,
    P,
    PasswordForm,
    UiPanel,
    SvgInject
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      ICON_VARIANTS,

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
    justify-content: space-between;

    height: 45vh;
    max-width: 765px;
    z-index: 1;
  }

  &__intr {
    margin-top: 100px;
  }

  &__words {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;

    min-height: 100px;
  }
}
</style>
