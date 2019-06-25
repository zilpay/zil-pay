<template>
  <div>
    <BackBar/>
    
    <main class="animated fadeIn faster is-mini">
      <div class="form-border change-gas">
        <div>
          <label for="gasPrice">Gas Price (Li)</label>
          <input type="number" id="gasPrice" v-model="gasPrice">
        </div>
        <div>
          <label for="gasLimit">Gas Limit</label>
          <input type="number" id="gasLimit" v-model="gasLimit">
        </div>

        <small>fee: {{fee}}</small>
      </div>

      <div class="change-time text-left" @mouseleave="isInput = false">
        <label>Auto-Logout Timer (hours)</label>
        <div class="dropdown-el text-black" @click="isInput = !isInput">
          {{lockTime}}
          <img src="/icons/drop-down-arrow.svg" height="15">
        </div>
        
        <div class="dropdown-input text-black" v-show="isInput">
          <div class="item"
                v-for="item of itemsTime"
                :key="item"
                @click="selectTime(item)">
            <div class="name">{{item}} hour.</div>
          </div>
        </div>
      </div>

      <button class="def"
              @click="defaultAll">default</button>
    </main>
  </div>
</template>

<script>
import GasFee from '../mixins/gas-fee'
import { mapState, mapMutations } from 'vuex'
import API from '../../config/api.json'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Advanced',
  components: { BackBar },
  mixins: [GasFee],
  data() {
    return {
      isInput: false,
      itemsTime: [1, 2 , 3, 4, 5]
    };
  },
  computed: {
    ...mapState('Static', ['lockTime'])
  },
  methods: {
    ...mapMutations('Static', [
      'mutateLockTime'
    ]),
    selectTime(time) {
      if (time > 5 || isNaN(time)) {
        return null;
      }

      this.mutateLockTime(time);
    },
    defaultAll() {
      this.toDefaultGas();
      this.mutateLockTime(API.TIME_BEFORE_LOCK);
    }
  },
  mounted() {
    this.gasMutate = true;
  }
}
</script>

<style lang="scss">

.change-gas {
  margin: 30px;
  padding: 30px;
  margin-top: 30px;
}
.change-time {
  width: 300px;
  justify-self: center;
}
</style>