<template>
  <div :class="b()">
    <div :class="b('info')">
      <Title :size="SIZE_VARIANS.md">
        {{ getCurrentAccount.name }}
      </Title>
      <P
        v-tooltip="copytitle"
        :content="getCurrentAccount.address | toAddress(addressFormat, false)"
        copy
        @copy="onCopyMixin"
      >
        {{ getCurrentAccount.address | toAddress(addressFormat) }}
      </P>
    </div>
    <div :class="b('balance')">
      <Title :size="SIZE_VARIANS.md">
        {{ TITLE }}
      </Title>
      <P>
        {{ getCurrentAccount.balance | fromZil }}
      </P>
      <P
        :class="b('amount-currency')"
        :size="FONT_VARIANTS.medium"
      >
        {{ getCurrentAccount.balance | toConversion(0.001) }}
      </P>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  ADDRESS_FORMAT_VARIANTS
} from '@/config'

import { toAddress, fromZil, toConversion } from '@/filters'
import CopyMixin from '@/mixins/copy'

import Title from '@/components/Title'
import P from '@/components/P'

const TITLE = 'Balance'
const COPY_FORMS = {
  copy: 'copy',
  copied: 'copied'
}

export default {
  name: 'Account',
  components: {
    Title,
    P
  },
  mixins: [CopyMixin],
  filters: { toAddress, fromZil, toConversion },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      ADDRESS_FORMAT_VARIANTS,
      TITLE,
      copytitle: COPY_FORMS.copy
    }
  },
  computed: {
    ...mapState('settings', ['addressFormat']),
    ...mapGetters('accounts', ['getCurrentAccount'])
  }
}
</script>

<style lang="scss">
.Account {
  display: grid;
  grid-template-rows: 100px 100px;
  justify-content: left;
  align-items: center;
  min-width: calc(360px - 30px);

  &__amount-currency {
    font-size: 12px;
    line-height: 19px;
  }
}
</style>
