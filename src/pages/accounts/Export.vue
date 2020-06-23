<template>
  <div :class="b()">
    <TopBar close/>
    <div :class="b('alert')">
      <P :font="FONT_VARIANTS.medium">
        {{ local.EXPORT_WARNING }}
      </P>
      <P :class="b('info')">
        {{ local.EXPORT_INFO }}
      </P>
    </div>
    <div :class="b('wrapper')">
      <RadioGroup
        v-model="radioGroupModel"
        :elements="radioGroupElements"
        @input="content = null"
      />
      <form
        v-show="radioGroupModel && !content"
        @submit.prevent="onSubmit"
      >
        <Input
          v-model="password.model"
          :placeholder="local.PASSWORD"
          :title="local.EXPORT_CAN_PASSWROD"
          :type="INPUT_TYPES.password"
          :error="password.error"
          round
          required
          second
          @input="password.error = null"
        />
        <Button
          :class="b('next-btn')"
          :color="COLOR_VARIANTS.negative"
          :size="SIZE_VARIANS.md"
          round
        >
          {{ local.NEXT }}
        </Button>
      </form>
    </div>
    <div
      v-show="content"
      :class="b('warn-info')"
    >
      <Icon
        :icon="ICON_VARIANTS.warn"
        width="30"
        height="40"
      />
      <P>
        {{ local.EXPORT_DANGER }}
      </P>
    </div>
    <Textarea
      v-show="content"
      v-model="content"
      readonly
    />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'

import {
  ICON_TYPE,
  ICON_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS,
  COLOR_VARIANTS
} from '@/config'

import TopBar from '@/components/TopBar'
import Button from '@/components/Button'
import Textarea from '@/components/Textarea'
import Icon from '@/components/Icon'
import Input, { INPUT_TYPES } from '@/components/Input'
import P from '@/components/P'
import RadioGroup from '@/components/RadioGroup'

import { Background } from '@/services'

export default {
  name: 'Export',
  components: {
    TopBar,
    Button,
    Input,
    Icon,
    Textarea,
    P,
    RadioGroup
  },
  data() {
    return {
      ICON_TYPE,
      ICON_VARIANTS,
      FONT_VARIANTS,
      SIZE_VARIANS,
      INPUT_TYPES,
      COLOR_VARIANTS,

      radioGroupModel: null,
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
    ]),

    radioGroupElements() {
      return [
        this.local.PRIVATEKEY,
        this.local.PHRASE
      ]
    }
  },
  methods: {
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),

    async onSubmit() {
      this.setLoad()

      const currenType = this.radioGroupModel.toLowerCase()
      const privKey = this.local.PRIVATEKEY.toLowerCase()
      const phrase = this.local.PHRASE.toLowerCase()

      switch (currenType) {
      case privKey:
        await this.onPrivateKey()
        break
      case phrase:
        await this.onSeed()
        break
      default:
        break
      }

      this.setLoad()
    },
    async onSeed() {
      const bg = new Background()

      try {
        this.content = await bg.exportSeed(this.password.model)
      } catch (err) {
        this.password.error = `${this.local.INCORRECT} ${this.local.PASSWORD}`
      }
    },
    async onPrivateKey() {
      const bg = new Background()

      try {
        this.content = await bg.exportPrivKey(this.password.model)
      } catch (err) {
        this.password.error = `${this.local.INCORRECT} ${this.local.PASSWORD}`
      }
    }
  },
  beforeMount() {
    if (this.$route.query && this.$route.query.type) {
      this.radioGroupModel = this.radioGroupElements[Number(this.$route.query.type)]
    }
  }
}
</script>

<style lang="scss">
.Export {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__wrapper {
    min-width: 300px;

    & > form {
      display: flex;
      flex-direction: column;
      align-items: center;

      margin-top: 30px;

      & > .Input {
        min-width: 250px;
      }
    }
  }

  &__alert {
    min-width: 300px;
    padding-left: 20px;
  }

  &__next-btn {
    min-width: 260px;
    margin-top: 15px;
  }

  &__info {
    font-size: 15px;
    line-height: 20px;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  &__warn-info {
    display: flex;
    align-items: center;

    padding: 15px;

    & > .P {
      margin-left: 5px;
    }
  }
}
</style>
