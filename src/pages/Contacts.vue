<template>
  <div :class="b()">
    <Top />
    <AddMenu @click="contactModal = true"/>
    <div :class="b('wrapper')">
      <Title :size="SIZE_VARIANS.md">
        {{ $options.name }}
      </Title>
      <div :class="b('list')">
        <div
          v-for="(contact, index) of contactList"
          :key="index"
        >
          {{ contact }}
        </div>
        <Title
          v-show="!contactList || contactList.length === 0"
          :size="SIZE_VARIANS.sm"
          :font="FONT_VARIANTS.regular"
          :variant="COLOR_VARIANTS.gray"
        >
          {{ local.HAS_NO_CONTACTS }}
        </Title>
      </div>
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

import { SIZE_VARIANS, FONT_VARIANTS, COLOR_VARIANTS } from '@/config'

import Top from '@/components/Top'
import Title from '@/components/Title'
import AddMenu from '@/components/AddMenu'
import BottomModal from '@/components/BottomModal'
import ContactCreater from '@/components/ContactCreater'

export default {
  name: 'Contacts',
  components: {
    Top,
    Title,
    AddMenu,
    BottomModal,
    ContactCreater
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      COLOR_VARIANTS,

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
    ])
  }
}
</script>

<style lang="scss">
.Contacts {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__list {
    display: grid;
    grid-gap: 10px;

    margin-top: 10px;

    overflow-y: scroll;
    height: calc(100vh - 250px);
    min-width: 300px;
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
