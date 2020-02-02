<template>
  <div
    :class="b()"
    @click="onView"
  >
    <Title :size="SIZE_VARIANS.sm">
      Viewblock
    </Title>
    <Icon
      src="/illustrations/viewblock-logo.png"
      height="40"
      width="40"
      :type="ICON_TYPE.auto"
    />
  </div>
</template>

<script>
import { SIZE_VARIANS, ICON_TYPE } from '@/config'

import Title from '@/components/Title'
import Icon from '@/components/Icon'

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
    Title,
    Icon
  },
  mixins: [viewblockMixin],
  data() {
    return {
      SIZE_VARIANS,
      ICON_TYPE
    }
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
  float: right;

  cursor: pointer;

  padding-top: 15px;
  padding-bottom: 15px;
}
</style>
