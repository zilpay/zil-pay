<template>
  <Button
    :class="b()"
    :size="SIZE_VARIANS.sm"
    :color="COLOR_VARIANTS.transparent"
    round
    @click="onView"
  >
    <Icon
      :icon="ICON_VARIANTS.viewblockLogo"
      height="40"
      width="40"
      :type="ICON_TYPE.png"
    />
    {{ local.VIEW }} {{ local.ON }} ViewBlock
  </Button>
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import { COLOR_VARIANTS, SIZE_VARIANS, ICON_TYPE, ICON_VARIANTS } from '@/config'

import Icon from '@/components/Icon'
import Button from '@/components/Button'

import viewblockMixin from '@/mixins/viewblock'

/**
 * Link for show tranasction or address on viewblock.io
 * @param address Zilliqa address(zil1)
 * @param hash Zilliqa Transaction ID.
 * @example
 * import ViewblockLink from '@/components/ViewblockLink'
 * const address = 'zil1zxvjnkxr3r0rv582rv7u0w07pnh0ap30td4thr'
 * const hash = 'aaf3ef4c1e5135ac112d55082d27c9c235385bf517c9005e0fc82cbfcd735730'
 * <ViewblockLink :address="address"/>
 * <ViewblockLink :hash="hash"/>
 */
export default {
  name: 'ViewblockLink',
  props: {
    address: {
      type: String,
      required: false
    },
    hash: {
      type: String,
      required: false
    }
  },
  components: {
    Button,
    Icon
  },
  mixins: [viewblockMixin],
  data() {
    return {
      SIZE_VARIANS,
      ICON_TYPE,
      ICON_VARIANTS,
      COLOR_VARIANTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
  },
  methods: {
    onView() {
      if (this.address) {
        this.onViewblockAddress(this.address)
      } else if (this.hash) {
        this.onViewblockTx(this.hash)
      }
    }
  }
}
</script>

<style lang="scss">
.ViewblockLink {
  display: flex;
  align-items: center;

  padding: 20px;

  & > img {
    margin-right: 5px;
  }
}
</style>
