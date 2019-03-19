<template>
  <div class="input-group-append">
    <button v-btn="classBtn + ' dropdown-toggle'"
            @click="toggleMenu">
      {{text}}
    </button>
    <div class="dropdown-menu bg-violet text-pink text-center"
         :class="{show: showMenu}">

      <a v-for="option of options"
         :key="option"
         @click="updateOption(option)"
         class="dropdown-item">{{option}}</a>
    </div>
  </div>
</template>

<script>
import btn from '../../directives/btn'

export default {
  name: 'Dropdown',
  directives: { btn },
  data() {
    return {
      showMenu: false,
      text: ''
    }
  },
  props: {
    // {class, text} //
    options: Array,
    classBtn: String,
    selected: String,
    anException: {
      type: String,
      default: null
    }
  },
  methods: {
    updateOption(option) {
      this.toggleMenu();
      
      if (!option == this.anException) {
        this.text = option;
      }

      this.$emit('updateOption', option);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    }
  },
  mounted() {
    this.text = this.selected;
  }
}
</script>

<style lang="scss">
@import "../../styles/colors";

.dropdown-item {
  cursor: pointer;
}
.dropdown-menu {
  right: 40% !important;
  left: 40% !important;
}
@media screen and (max-width: 600px) {
  .dropdown-menu {
    right: 0 !important;
    left: 0 !important;
  }
}
</style>
