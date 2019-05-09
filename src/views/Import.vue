<template>
  <div class="container">
    <h5 class="mr-auto p-2 point text-warning"
        @click="$router.go(-1)">&#60;BACK</h5>
    <h3 class="col-lg-12 text-ightindigo">
      PrivateKey
    </h3>

    <div class="row justify-content-center">
      <textarea class="form-control bg-null"
                v-model="text"
                @input="errMsg = null">
      </textarea>
      <button v-btn="'info btn-lg m-2'"
              @click="importThis">
        import
      </button>
      <button v-btn="'warning btn-lg m-2'"
              @click="$router.push({name: 'home'})">
        close
      </button>
      <small class="form-text text-danger">{{errMsg}}</small>

      <button v-btn="'info btn-lg mt-5'" disabled>
        hardware wallet ledger
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import btn from '../directives/btn'


export default {
  name: 'Import',
  directives: { btn },
  data() {
    return {
      text: null,
      errMsg: null
    };
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions('storage', [
      'importByPrivateKey'
    ]),

    async importThis() {
      this.spiner();
      try {
        await this.importByPrivateKey(this.text);
      } catch(err) {
        this.errMsg = err.message;
      }
      this.spiner();

      if (!this.errMsg) {
        this.$router.push({ name: 'home' });
      }
    }
  }
}
</script>

<style>

</style>
