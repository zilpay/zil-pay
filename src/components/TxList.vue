<template>
  <div class="row">

    <div class="text-left title">History</div>

    <ul class="list text-black">
      <li class="pointer">
        <img src="/icons/contract.svg" height="20">

        <div class="info">
          <a href="" class="text-black underline">warden</a>
          <img src="/icons/caret-right.svg" height="20"
              class="img-border">
          <a href="" class="text-black underline">zil1xq...80trpf</a>
        </div>

        <div class="text-right">
          -992.2 <span class="text-primary">ZIL</span>
        </div>

        <span class="text-left">Deploy</span>
        <span class="text-center">view on viewblock</span>
        <div class="text-right">
          ≈10 <span class="text-primary">USD</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import clipboardMixin from '../mixins/clipboard'
import AccountListing from '../mixins/account-listing'


export default {
  name: 'TxList',
  mixins: [clipboardMixin, AccountListing]
}
</script>

<style lang="scss">
@import "../styles/color";
@import "../styles/dimensions";


.title {
  margin: 10px;
  margin-top: 20px;
  font-size: 15px;
}

.list {
  display: grid;
  grid-template-columns: 1fr;
  width: $nav-max-width;
  min-width: $nav-min-width;
  font-size: 12px;
  
  li {
    padding: 5px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid $color-primary;
    font-weight: 500;

    .info {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      justify-items: center;
      grid-gap: 10px;
    }

    &:hover {
      transition: background-color .3s ease;
      background-color: $color-translucent;
    }
  }
}
a.underline {
  border-radius: 10px;
  background: #2d4b56;
  height: 30px;
  padding: 5px;
  color: $color-initial;
  
  &:hover {
    background-color: $color-primary;
  }
}
@media screen and (max-width: $nav-max-width) {
  .list {
    margin-top: 0;
    border-radius: 0;
    width: $nav-min-width;
  }
}
</style>
