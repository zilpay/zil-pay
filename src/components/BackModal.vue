<template>
  <div :class="b({ back })">
    <a @click="onClose">
      <SvgInject :variant="ICON_VARIANTS.arrow"/>
    </a>
    <Title :size="SIZE_VARIANS.md">
      {{ name }}
    </Title>
  </div>
</template>

<script>
import { ICON_VARIANTS, SIZE_VARIANS, EVENTS } from '@/config'


import Title from '@/components/Title'
import SvgInject from '@/components/SvgInject'

export default {
  name: 'BackModal',
  components: {
    SvgInject,
    Title
  },
  props: {
    back: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      ICON_VARIANTS,
      SIZE_VARIANS
    }
  },
  methods: {
    onClose() {
      this.$emit(EVENTS.click)
    }
  }
}
</script>

<style lang="scss">
.BackModal {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;

  & > .Title {
    min-width: 80%;
    text-align: center;
    margin-right: 20px;
  }

  & > a > svg {
    transform: rotate(270deg);
  }

  & > a {
    cursor: pointer;
  }

  &_back {
    & > a > svg {
      transform: rotate(0);
    }
  }
}
</style>
