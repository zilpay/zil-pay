<template>
  <div>
    <BackBar/>

    <main>
      <div class="text-left" @mouseleave="isInput = false">
        <span>Currency Conversion</span>
        <div class="dropdown-el" @click="isInput = !isInput">
          {{currency}}
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
    </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'


export default {
  name: 'General',
  components: { BackBar },
  data() {
    return {
      isInput: false,

      currency: 'USD',
      items: ['BTC', 'ETH', 'TRX']
    };
  },
  methods: {
    selected(item) {
      this.currency = item;
      this.isInput = false;
    }
  }
}
</script>

<style lang="scss">
.dropdown-el {
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  height: 40px;
  width: 100%;
  border: 1px solid #dedede;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  padding: 6px;

  img {
    opacity: 0.5;
    grid-column: 3;
  }
}
</style>