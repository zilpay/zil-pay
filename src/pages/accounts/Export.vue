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
      <form :class="b('form')">
        <Input
          :placeholder="local.PASSWORD"
          :title="local.EXPORT_CAN_PASSWROD"
          :type="INPUT_TYPES.password"
          round
        />
        <Button
          :class="b('next-btn')"
          round
        >
          {{ local.NEXT }}
        </Button>
      </form>
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

      radioGroupModel: 0
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
  }
}
</script>

<style lang="scss">
.Export {
  &__wrapper {
    padding-top: 30px;
    padding-left: 15px;
    padding-right: 15px;
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
}
</style>
