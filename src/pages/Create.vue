<template>
  <div :class="b()">
    <UiPanel arrow />
    <SvgInject
      :class="b('logo')"
      :variant="ICON_VARIANTS.zilPayLogo"
    />
    <div :class="b('wrapper')">
      <div>
        <Title :size="SIZE_VARIANS.lg">
          {{ local.CREATE_TITLE }}
        </Title>
        <P :size="SIZE_VARIANS.md">
          {{ local.CREATE_DIS }}
        </P>
      </div>
      <div
        :class="b('reset-icon')"
        @click="refreshWords"
      >
        <SvgInject :variant="ICON_VARIANTS.refresh" />
      </div>
      <div :class="b('words')">
        <Chip
          v-for="(el, index) of wrdsAsArray"
          :key="el.uuid"
          :circle="index + 1"
        >
          {{ el.word }}
        </Chip>
      </div>
      <div :class="b('btns')">
        <Button
          :color="COLOR_VARIANTS.negative"
          block
          round
          uppercase
          @click="prinntWords"
        >
          {{ local.PRINT }}
        </Button>
        <Button
          :color="COLOR_VARIANTS.negative"
          :size="SIZE_VARIANS.md"
          block
          round
          uppercase
          @click="setWords"
        >
          {{ local.CONTINUE }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'

import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import walletStore from '@/store/wallet'

import {
  ICON_VARIANTS,
  SIZE_VARIANS,
  COLOR_VARIANTS
} from '@/config'

import Verify from '@/pages/Verify'

import Chip from '@/components/Chip'
import Title from '@/components/Title'
import P from '@/components/P'
import Button from '@/components/Button'
import UiPanel from '@/components/UiPanel'
import Printer from '@/mixins/printer'
import SvgInject from '@/components/SvgInject'

import { Background } from '@/services'

const bgScript = new Background()

export default {
  name: 'Create',
  mixins: [Printer],
  components: {
    Chip,
    P,
    Title,
    Button,
    UiPanel,
    SvgInject
  },
  data() {
    return {
      ICON_VARIANTS,
      SIZE_VARIANS,
      COLOR_VARIANTS,
      words: ''
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),

    wrdsAsArray() {
      return this
        .words
        .split(' ')
        .map(word => ({
          word,
          uuid: uuid()
        }))
    }
  },
  methods: {
    ...mapMutations(walletStore.STORE_NAME, [
      walletStore.MUTATIONS_NAMES.setVerifly
    ]),

    setWords() {
      this.setVerifly(this.words)
      this.$router.push({ name: Verify.name })
    },
    async refreshWords() {
      this.words = await bgScript.getRandomMnemonic()
    },
    prinntWords() {
      // Call from Printer mixin.
      this.printSeed()
    }
  },
  mounted() {
    this.refreshWords()
  }
}
</script>

<style lang="scss">
.Create {
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

  &__reset-icon {
    justify-self: right;
    cursor: pointer;
  }

  &__wrapper {
    display: grid;
    justify-items: center;
    grid-template-rows: max-content min-content 100px 50px;

    z-index: 1;
    height: 50vh;

    max-width: 700px;
  }

  &__words {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  &__btns {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    width: 264px;
    height: 100px;
    margin-top: 100px;
  }
}
</style>
