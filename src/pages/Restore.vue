<template>
  <div :class="b()">
    <UiPanel />
    <TopBar
      :route="false"
      back
    />
    <Container :class="b('wrapper')">
      <Title>
        {{ local.RESTORE_TITLE }}
      </Title>
      <P :class="b('description')">
        {{ local.RESTORE_DIS }}
      </P>
      <div>
        <Textarea
          v-model="seed.model"
          :error="seed.error"
          round
          @input="seed.error = null"
        />
        <PasswordForm
          :btn="local.RESTORE"
          @submit="restore"
        />
      </div>
    </Container>
    <Wave />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'

import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'

import Title from '@/components/Title'
import Textarea from '@/components/Textarea'
import TopBar from '@/components/TopBar'
import P from '@/components/P'
import Container from '@/components/Container'
import Wave from '@/components/Wave'
import PasswordForm from '@/components/PasswordForm'
import UiPanel from '@/components/UiPanel'

import { Background } from '@/services'

const bgScript = new Background()

export default {
  name: 'Restore',
  components: {
    Title,
    P,
    Container,
    Wave,
    Textarea,
    TopBar,
    PasswordForm,
    UiPanel
  },
  data() {
    return {
      COLOR_VARIANTS,
      SIZE_VARIANS,

      seed: {
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
    async restore(password) {
      if (!this.seed.model) {
        this.seed.error = this.local.SEED_REQUIRED

        return null
      }

      this.setLoad()

      try {
        await bgScript.createWallet({
          password,
          seed: this.seed.model
        })

        global.location.reload()
      } catch (err) {
        this.seed.error = this.local.SEED_INCORRECT
      } finally {
        this.setLoad()
      }
    }
  }
}
</script>

<style lang="scss">
.Restore {
  display: grid;
  justify-content: center;
  align-items: center;

  &__wrapper {
    padding-top: 30px;
    padding-right: 15px;
    padding-left: 15px;

    max-width: calc(360px - 30px);
  }

  &__description {
    padding-top: 30px;
    opacity: 0.5;
  }
}
</style>
