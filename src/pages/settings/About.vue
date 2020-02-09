<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <Icon :icon="ICON_VARIANTS.zilPayLogo"/>
      <Title :size="SIZE_VARIANS.sm">
        ZilPay Version 0.3.6
      </Title>
      <Title :size="SIZE_VARIANS.sm">
        Thanks for your donats.
      </Title>
      <P
        v-tooltip="copytitle"
        :class="b('address')"
        :size="SIZE_VARIANS.sm"
        :content="donateAddress"
        copy
        nowrap
        @copy="onCopyMixin"
      >
        {{ donateAddress }}
      </P>
    </Container>
    <Container>
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
            {{ link.name }}
          </a>
        </li>
      </ul>
    </Container>
    <Container :class="b('wrapper')">
      <a
        :class="b('owner-link')"
        :href="owner.url"
        target="_blank"
      >
        By: {{ owner.name }}
      </a>
    </Container>
  </div>
</template>

<script>
import { ICON_VARIANTS, SIZE_VARIANS } from '@/config'

import TopBar from '@/components/TopBar'
import Icon from '@/components/Icon'
import Container from '@/components/Container'
import Title from '@/components/Title'
import P from '@/components/P'

import CopyMixin from '@/mixins/copy'

export default {
  name: 'About',
  components: {
    TopBar,
    Icon,
    Container,
    Title,
    P
  },
  mixins: [CopyMixin],
  data() {
    return {
      ICON_VARIANTS,
      SIZE_VARIANS,
      owner: {
        name: 'Rinat',
        url: 'https://github.com/lich666dead'
      },
      donateAddress: 'zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace',
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
        },
        {
          name: 'Documentation',
          url: 'https://zilpay.xyz/Documentation/'
        },
        {
          name: 'License MIT',
          url: 'https://github.com/zilpay/zil-pay/blob/master/LICENSE'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.About {
  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px;
  }

  &__links {
    list-style: none;
    font-weight: 500;
    font-size: 10px;
    line-height: 28px;
  }

  &__link,
  &__owner-link {
    text-decoration: none;
    color: var(--theme-color-font);
  }

  &__address {
    width: 250px;
  }

  &__owner-link {
    text-align: center;
  }
}
</style>
