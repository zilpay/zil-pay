<template>
  <div>
    <div class="form-group">
      <label for="buy">Buy amount token</label>
      <input v-model="amount" type="number" class="form-control" id="buy" placeholder="amount">
    </div>
    <button @click="submit" type="submit" class="btn btn-primary">Buy</button>
  </div>
</template>

<script>
export default {
  name: 'BuyForm',
  data() {
    return {
      amount: 0
    };
  },
  methods: {
    submit() {
      this.$emit('buy', this.amount);
    },
  }
}
</script>

<style>

</style>
