<template>
  <div class="row">

    <div class="text-left title">History</div>

    <ul class="list text-black">
      <li>
        <a href="">
          <img src="/icons/contract.svg" height="20">
          <span>Call</span>
        </a>
        <div class="info">
          <a href="" class="text-black">warden</a>
          <img src="/icons/caret-right.svg" height="20"
              class="img-border">
          <a href="" class="text-black">zil1xq...80trpf</a>
        </div>
        <div class="text-right">
          -992.2 <span class="text-primary">ZIL</span>
        </div>
      </li>
      <li>
        <a href="" class="text-primary"><img src="/icons/send-dark.svg" height="20"></a>
        <div class="info">
          <a href="" class="text-black">warden</a>
          <img src="/icons/caret-right.svg" height="20"
              class="img-border">
          <a href="" class="text-black">zil1t...h639c2</a>
        </div>
        <div class="text-right">
          -992.2 <span class="text-primary">ZIL</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import clipboardMixin from '../mixins/clipboard'


export default {
  name: 'TxList',
  mixins: [clipboardMixin]
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
  // padding: 20px;
  display: grid;
  grid-template-columns: 1fr;
  width: $nav-max-width;
  min-width: $nav-min-width;
  font-size: 15px;
  
  li {
    padding: 5px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid $color-primary;
    font-weight: 500;

    a {
      span {
        padding: 5px;
      }
    }

    .info {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      justify-items: center;
      grid-gap: 10px;

      a:hover {
        text-decoration: underline;
      }
    }

    &:hover {
      transition: background-color .3s ease;
      background-color: $color-translucent;
    }
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
