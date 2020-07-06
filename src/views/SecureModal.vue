<template>
  <form
    :class="b()"
    @submit.prevent="onEvent"
  >
    <Input
      v-show="!content"
      v-model="password.model"
      :placeholder="local.PASSWORD"
      :type="INPUT_TYPES.password"
      :error="password.error"
      round
      required
      autofocus
      @input="password.error = null"
    />
    <Button
      v-show="!content"
      :color="COLOR_VARIANTS.negative"
      round
      uppercase
    >
      {{ local.REVEAL }}
    </Button>
    <Textarea
      v-show="content"
      v-model="content"
      readonly
    />
    <div
      v-show="content"
      :class="b('warn')"
    >
      <Icon
        :icon="ICON_VARIANTS.warn"
        width="25"
        height="25"
      />
      <P>
        {{ local.EXPORT_DANGER }}
      </P>
    </div>
  </form>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'

import {
  COLOR_VARIANTS,
  SIZE_VARIANS,
  FONT_VARIANTS,
  ICON_VARIANTS,
  EVENTS
} from '@/config'

import Input, { INPUT_TYPES } from '@/components/Input'
import Button from '@/components/Button'
import P from '@/components/P'
import Icon from '@/components/Icon'
import Textarea from '@/components/Textarea'

import { Background } from '@/services'

import { download } from '@/utils'

export default {
  name: 'SecureModal',
  components: {
    Input,
    Textarea,
    Icon,
    P,
    Button
  },
  props: {
    modalType: {
      type: [Number, String]
    }
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      FONT_VARIANTS,
      INPUT_TYPES,
      ICON_VARIANTS,

      content: null,
      password: {
        model: null,
        error: null
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
  },
  methods: {
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),

    async onEvent() {
      this.setLoad()
      switch (Number(this.modalType)) {
      case 0:
        await this.onPrivateKey()
        break
      case 1:
        await this.onSeed()
        break
      case 2:
        await this.onKeystore()
        break
      default:
        break
      }
      this.setLoad()
    },
    async onPrivateKey() {
      const bg = new Background()

      try {
        const { privateKey } = await bg.exportPrivKey(this.password.model)

        this.content = privateKey

      } catch (err) {
        this.password.error = `${this.local.INCORRECT} ${this.local.PASSWORD}`
      }
    },
    async onSeed() {
      const bg = new Background()
      try {
        this.content = await bg.exportSeed(this.password.model)
      } catch (err) {
        this.password.error = `${this.local.INCORRECT} ${this.local.PASSWORD}`
      }
    },
    async onKeystore() {
      const bg = new Background()

      try {
        const { keystore } = await bg.exportPrivKey(this.password.model)

        download('keystore.json', keystore)
        this.$emit(EVENTS.close)
      } catch (err) {
        this.password.error = `${this.local.INCORRECT} ${this.local.PASSWORD}`
      }
    }
  }
}
</script>

<style lang="scss">
.SecureModal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  padding-bottom: 20px;
  padding-top: 20px;

  min-height: 100px;

  &__warn {
    display: flex;
    align-items: center;

    & > .P {
      margin-left: 5px;
    }
  }

  & > .Input {
    width: 90%;
  }

  & > .Button {
    width: 100px;
  }

  & > .Textarea > textarea {
    border: 0;
    background-color: var(--accent-color-second);
    color: var(--accent-color-primary);
  }
}
</style>
