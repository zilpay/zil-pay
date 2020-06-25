<template>
  <div :class="b()">
    <Top />
    <AddMenu @click="contactModal = true"/>
    <div :class="b('wrapper')">
      <Title :size="SIZE_VARIANS.md">
        {{ $options.name }}
      </Title>
      <ul :class="b('scroll')">
        <li
          v-for="(contact, index) of contactList"
          :key="index"
          :class="b('item')"
          @click="onSelectContact(contact)"
        >
          <SvgInject :variant="ICON_VARIANTS.profile"/>
          <P :font="FONT_VARIANTS.regular">
            {{ contact.name }}
          </P>
          <DropDown>
            <div>asdsadsa</div>
            <div>asdsadsa</div>
            <div>asdsadsa</div>
            <div>asdsadsa</div>
          </DropDown>
        </li>
        <Title
          v-show="!contactList || contactList.length === 0"
          :size="SIZE_VARIANS.sm"
          :font="FONT_VARIANTS.regular"
          :variant="COLOR_VARIANTS.gray"
        >
          {{ local.HAS_NO_CONTACTS }}
        </Title>
      </ul>
      <BottomBar />
    </div>
    <BottomModal v-model="contactModal">
      <ContactCreater
        v-if="contactModal"
        @close="contactModal = false"
      />
    </BottomModal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import contactsStore from '@/store/contacts'
import uiStore from '@/store/ui'

import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  COLOR_VARIANTS,
  ICON_VARIANTS
} from '@/config'

import Top from '@/components/Top'
import Title from '@/components/Title'
import P from '@/components/P'
import AddMenu from '@/components/AddMenu'
import BottomModal from '@/components/BottomModal'
import ContactCreater from '@/components/ContactCreater'
import DropDown from '@/components/DropDown'
import SvgInject from '@/components/SvgInject'

export default {
  name: 'Contacts',
  components: {
    Top,
    Title,
    P,
    AddMenu,
    BottomModal,
    ContactCreater,
    DropDown,
    SvgInject
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      COLOR_VARIANTS,
      ICON_VARIANTS,

      contactModal: false
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(contactsStore.STORE_NAME, [
      contactsStore.STATE_NAMES.contactList
    ])
  },
  methods: {
    ...mapActions(contactsStore.STORE_NAME, [
      contactsStore.ACTIONS_NAMES.onRemoveByIndex
    ]),

    onSelectContact(contact) {
      // this.$router.push({
      //   name: SendPage.name,
      //   params: {
      //     address: toAddress(
      //       contact.address,
      //       this.addressFormat,
      //       false
      //     )
      //   }
      // })
    }
  }
}
</script>

<style lang="scss">
.Contacts {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__scroll {
    display: grid;
    grid-gap: 10px;

    padding: 0;
    margin-top: 10px;
    list-style: none;

    overflow-y: scroll;
    height: calc(100vh - 250px);
    min-width: 300px;
  }

  &__item {
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: space-between;

    height: min-content;
    min-height: 30px;
    font-size: 18px;
  }

  &__wrapper {
    & > .Title {
      text-align: center;
      margin-top: 30px;
      margin-bottom: 30px;
    }
  }
}
</style>
