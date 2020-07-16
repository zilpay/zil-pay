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
        >
          <div @click="onSelectContact(contact)">
            <SvgInject :variant="ICON_VARIANTS.profile"/>
          </div>
          <P
            :font="FONT_VARIANTS.regular"
            @click="onSelectContact(contact)"
          >
            {{ contact.name }}
          </P>
          <DropDown
            :items="dropDownItems"
            @selected="onDropDownSelected($event, contact, index)"
          />
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
    <BottomModal v-model="editContactModal">
      <ContactCreater
        v-if="editContactModal"
        :contactIndex="contactIndex"
        edit
        @close="editContactModal = false"
      />
    </BottomModal>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import copy from 'clipboard-copy'

import { mapState, mapActions, mapMutations } from 'vuex'
import contactsStore from '@/store/contacts'
import uiStore from '@/store/ui'
import modalStore from '@/store/modal'
import settingsStore from '@/store/settings'

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

import { toAddress } from '@/filters'

const DROP_DOWN_EVENTS = {
  copy: uuid(),
  edit: uuid(),
  delete: uuid()
}

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

      contactModal: false,
      editContactModal: false,
      contactIndex: null
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(contactsStore.STORE_NAME, [
      contactsStore.STATE_NAMES.contactList
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
    ]),

    dropDownItems() {
      return [
        {
          icon: ICON_VARIANTS.copy,
          text: this.local.COPY,
          event: DROP_DOWN_EVENTS.copy
        },
        {
          icon: ICON_VARIANTS.edit,
          text: this.local.EDIT,
          event: DROP_DOWN_EVENTS.edit
        },
        {
          icon: ICON_VARIANTS.trash,
          text: this.local.DELETE,
          event: DROP_DOWN_EVENTS.delete
        }
      ]
    }
  },
  methods: {
    ...mapActions(contactsStore.STORE_NAME, [
      contactsStore.ACTIONS_NAMES.onRemoveByIndex
    ]),
    ...mapMutations(modalStore.STORE_NAME, [
      modalStore.MUTATIONS_NAMES.setSendModalPayload,
      modalStore.MUTATIONS_NAMES.setShowSendModal,
      modalStore.MUTATIONS_NAMES.setNumberStep
    ]),

    onDropDownSelected(event, contact, index) {
      switch (event.el.event) {
      case DROP_DOWN_EVENTS.copy:
        copy(contact.address)
        break
      case DROP_DOWN_EVENTS.edit:
        this.contactIndex = index
        this.editContactModal = true
        break
      case DROP_DOWN_EVENTS.delete:
        this.onRemoveByIndex(index)
        break

      default:
        break
      }
    },

    onSelectContact(contact) {
      const payload = {
        address: toAddress(
          contact.address,
          this.addressFormat,
          false
        )
      }

      this.setSendModalPayload(payload)
      this.setShowSendModal()
      this.setNumberStep(4)
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
    display: flex;
    flex-direction: column;

    padding: 0;
    list-style: none;

    overflow-y: scroll;
    height: calc(100vh - 250px);
    min-width: 300px;

    & > li {
      margin-top: 10px;
      margin-bottom: 10px;
    }
  }

  &__drop-i {
    font-size: 12px;
    display: flex;
  }

  &__item {
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: space-between;

    height: min-content;
    min-height: 30px;
    font-size: 18px;

    & > .P {
      width: 80%;
    }
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
