<template>
  <div>
    <BackBar/>

    <main>
      <div class="change-net text-left" @mouseleave="isInput = false">
        <div class="dropdown-el text-black" @click="isInput = !isInput">
          {{selectedNet}}
          <img src="/icons/drop-down-arrow.svg" height="15">
        </div>
        
        <div class="dropdown-input text-black" v-show="isInput">
          <div class="item"
                v-for="item of items"
                :key="item"
                @click="selected(item)">
            <div class="name">{{item}}</div>
          </div>
        </div>
      </div>

      <div class="form-border net-form">
        <div>
          <label for="node">MainNet</label>
          <input type="number" id="node">
        </div>
        <div>
          <label for="msg">MSG ID</label>
          <input type="number" id="msg">
        </div>
      </div>

      <button class="def">default</button>
    </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'


export default {
  name: 'Networks',
  components: { BackBar },
  data() {
    return {
      isInput: false,
      selectedNet: 'mainnet',

      items: ['mainnet', 'testnet', 'localnet']
    };
  },
  methods: {
    selected(item) {
      this.selectedNet = item;
      this.isInput = false;
    }
  }
}
</script>

<style lang="scss">
.change-net {
  padding: 30px;
}
.net-form {
  margin: 30px;
  padding: 30px;
  margin-top: 30px;
}

</style>