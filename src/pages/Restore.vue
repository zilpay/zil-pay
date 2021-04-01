<template>
  <div :class="b()">
    <UiPanel arrow />
    <div :class="b('wrapper')">
      <Textarea
        v-model="seed.model"
        :error="seed.error"
        :title="local.SECRET_PHRACSE"
        round
        @input="seed.error = null"
      />
      <PasswordForm
        :btn="local.RESTORE"
        @submit="restore"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'

import { COLOR_VARIANTS, SIZE_VARIANS, ICON_VARIANTS } from '@/config'

import Congratulation from '@/pages/Congratulation'

import Textarea from '@/components/Textarea'
import PasswordForm from '@/components/PasswordForm'
import UiPanel from '@/components/UiPanel'

import { Background } from '@/services'

const bgScript = new Background()

export default {
  name: 'Restore',
  components: {
    Textarea,
    PasswordForm,
    UiPanel
  },
  data() {
    return {
      COLOR_VARIANTS,
      SIZE_VARIANS,
      ICON_VARIANTS,

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

        this.$router.push({ name: Congratulation.name })
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
  text-align: center;
  background-color: var(--app-background-color);

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0 20px;
  }

  &__description {
    margin-bottom: 80px;
  }
}
</style>
