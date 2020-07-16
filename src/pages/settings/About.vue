<template>
  <div :class="b()">
    <TopBar />
    <SvgInject
      :class="b('logo')"
      :variant="ICON_VARIANTS.zilPayLogo"
    />
    <div :class="b('wrapper')">
      <Title :size="SIZE_VARIANS.md">
        ZilPay Version {{ version }}
      </Title>
      <ul :class="b('links')">
        <li
          v-for="(link, index) of links"
          :key="index"
        >
          <a
            :class="b('link')"
            :href="link.url"
            target="_blank"
          >
            <P>
              {{ link.name }}
            </P>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import extension from 'extensionizer'
import { ICON_VARIANTS, SIZE_VARIANS } from '@/config'

import TopBar from '@/components/TopBar'
import Title from '@/components/Title'
import P from '@/components/P'
import SvgInject from '@/components/SvgInject'

import CopyMixin from '@/mixins/copy'

export default {
  name: 'About',
  components: {
    TopBar,
    Title,
    SvgInject,
    P
  },
  mixins: [CopyMixin],
  data() {
    return {
      ICON_VARIANTS,
      SIZE_VARIANS,
      version: extension.runtime.getManifest().version,
      links: [
        {
          name: 'Github',
          url: 'https://github.com/zilpay/zil-pay'
        },
        {
          name: 'Privacy policy',
          url: 'https://zilpay.xyz/Privacy'
        },
        {
          name: 'Terms and use',
          url: 'https://zilpay.xyz/Terms'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.About {
  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;

  background-color: var(--app-background-color);

  &__logo {
    position: absolute;
    top: 20vh;

    width: 50vw;
    height: 50vh;

    @media (max-width: 700px) {
      width: 70vw;
    }
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    z-index: 1;
  }

  &__links {
    list-style: none;
    line-height: 38px;
    padding: 0;
  }
}
</style>
