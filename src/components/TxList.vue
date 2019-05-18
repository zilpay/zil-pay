<template>
  <div class="row">
    <div class="tx-list">
      <div class="text-center text-white">
        History
      </div>
      
      <ul class="list text-white">
        <li class="item">

          <img src="/icons/contract.svg" height="30">

          <span class="text-center">
            -100 <span class="currency">ZIL</span>
            ≈ 10 <span class="currency">USD</span>
          </span>

          <span class="text-right">May 13th, 1:44 pm</span>

          <div class="hided detail">
            <span>hash: 0x3b78e6dec6e90f663ea783b04ad56bd5faadf87f0b763e7da994dc342b984091</span>
          </div>

        </li>
        <li class="item">

          <img src="/icons/send.svg" height="30">

          <span class="text-center">
            -34 <span class="currency">ZIL</span>
            ≈ 13 <span class="currency">USD</span>
          </span>

          <span class="text-right">May 13th, 1:44 pm</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TxList'
}
</script>
