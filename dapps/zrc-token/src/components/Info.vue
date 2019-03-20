<template>
  <div class="jumbotron">
    <h1 class="display-5">Contract info!</h1>
    <p>address: {{address}}</p>
    <p class="lead text-warning">Contract balance: {{state.balance || 0}}</p>
    <p class="lead text-warning">Your tokens: {{state.tokens || 0}}</p>
    <p class="lead text-warning">token price: {{state.price || 0}}</p>
    <hr class="my-4">
    <a class="btn btn-primary btn-lg" href="#" role="button">withdraw</a>
  </div>
</template>

<script>
export default {
  name: 'Info',
  props: {
    address: {
      type: String
    },
    state: {
      type: Object
    }
  }
}
</script>

<style>

</style>
