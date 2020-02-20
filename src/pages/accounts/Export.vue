<template>
  <div :class="b()">
    <TopBar close/>
    <Alert>
      <P :class="b('info')">
        {{ local.EXPORT_INFO }}
      </P>
      <P :font="FONT_VARIANTS.medium">
        {{ local.EXPORT_WARNING }}
      </P>
    </Alert>
    <Container :class="b('wrapper')">
      <RadioGroup
        v-model="radioGroupModel"
        :elements="radioGroupElements"
      />
      <form
        v-show="!seedWords"
        :class="b('form')"
        @submit.prevent="onSubmit"
      >
        <Input
          :placeholder="local.PASSWORD"
          :title="local.EXPORT_CAN_PASSWROD"
          :type="INPUT_TYPES.password"
          round
          required
        />
        <Button
          :class="b('next-btn')"
          round
        >
          {{ local.NEXT }}
        </Button>
      </form>
    </Container>
    <Alert v-show="seedWords">
      <Container :class="b('warn-info')">
        <Icon
          :icon="ICON_VARIANTS.warn"
          width="50"
          height="60"
        />
        <P>
          {{ local.EXPORT_DANGER }}
        </P>
      </Container>
    </Alert>
    <Container v-show="seedWords">
      <Textarea
        v-model="seedWords"
        readonly
      />
    </Container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import {
  ICON_TYPE,
  ICON_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS
} from '@/config'

import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import Textarea from '@/components/Textarea'
import Icon from '@/components/Icon'
import Input, { INPUT_TYPES } from '@/components/Input'
import P from '@/components/P'
import RadioGroup from '@/components/RadioGroup'

export default {
  name: 'Export',
  components: {
    TopBar,
    Container,
    Button,
    Input,
    Alert,
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

      radioGroupModel: 0,
      seedWords: null
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
    onSubmit() {
      this.seedWords = true
    }
  }
}
</script>

<style lang="scss">
.Export {
  &__wrapper {
    /* top | right | bottom | left */
    padding: 30px 15px 30px 15px;
  }

  &__next-btn {
    width: 175px;
  }

  &__form {
    display: grid;
    grid-gap: 15px;

    padding-top: 30px;
  }

  &__info {
    font-size: 15px;
    line-height: 20px;
  }

  &__warn-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
