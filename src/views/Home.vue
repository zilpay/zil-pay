<template>
  <div class="container">
    <div class="row justify-content-center">
      <img src="/img/logo.png">
    </div>
    <div class="text-center p-2 text-ightindigo display-4">
      <h1>
        4.4385 
        <span class="text-warning">ZIL</span>
      </h1>
      <h1>
         $605.67 
         <span class="text-warning">USD</span>
      </h1>
    </div>

    <div class="row justify-content-center">
      <button v-btn="'success m-2'">DEPOSIT</button>
      <button v-btn="'success m-2'">SEND</button>
    </div>

    <TxTracking/>
  </div>
</template>

<script>
import TxTracking from '../components/TxTracking'
import btn from '../directives/btn'

export default {
  name: 'home',
  directives: { btn },
  components: { TxTracking }
}
</script>
