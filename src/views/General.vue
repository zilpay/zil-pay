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

      <div>
        <h5>Clear history transaction.</h5>
        <button>Clear</button>
      </div>
    </main>
  </div>
</template>

<script>
const BackBar = () => import('../components/BackBar');


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