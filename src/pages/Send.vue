<template>
  <div :class="b()">
    <TopBar />
    <Alert :class="b('recipient')">
      <Title :size="SIZE_VARIANS.sm">
        {{ ALERT_TITLE }}
      </Title>
      <Input :placeholder="INPUT_PLACEHOLDER"/>
    </Alert>
  </div>
</template>

<script>
import { SIZE_VARIANS } from '@/config'

import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import Title from '@/components/Title'
import Input from '@/components/Input'

const ALERT_TITLE = 'Add recipient'
const INPUT_PLACEHOLDER = 'Select, public address (zil1), or ZNS'

export default {
  name: 'Send',
  components: {
    TopBar,
    Alert,
    Title,
    Input
  },
  data() {
    return {
      SIZE_VARIANS,
      ALERT_TITLE,
      INPUT_PLACEHOLDER
    }
  }
}
</script>

<style lang="scss">
.Send {
  &__recipient {
    min-height: 80px;
  }
}
</style>
