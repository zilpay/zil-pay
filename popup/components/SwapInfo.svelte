<script lang="ts">
	import dexStore from 'popup/store/dex';


</script>

<div class="info">
  <ul>
    <li>
      <b>Rate</b>
      <p class="pointer">
        1 ZIL = 123, 32.534543 ZLP <span>($100)</span>
      </p>
    </li>
    <li>
      <b>Price Impact</b>
      <p>
        0.003 <span>%</span>
      </p>
    </li>
    <li>
      <b>Transaction Fee</b>
      <p>
        3 <span>ZIL</span>
      </p>
    </li>
    <li>
      <b>Slippage Tolerance</b>
      <div>
        <input
          type="number"
          min="1"
          max="50"
          bind:value={$dexStore.slippage}
        />
        <b>
          %
        </b>
      </div>
    </li>
    <li>
      <b>Blocks timeout</b>
      <div>
        <input
          type="number"
          min="1"
          bind:value={$dexStore.blocks}
        />
        <b>
          TX-Blocks
        </b>
      </div>
    </li>
  </ul>
</div>

<style lang="scss">
	@import "../styles/mixins";

  div.info {
    background: var(--card-color);
    box-shadow: rgb(50 50 93 / 25%) 0px 2px 5px -1px, rgb(0 0 0 / 30%) 0px 1px 3px -1px;
    padding: 8px;
    width: 100%;

    @include border-radius(8px);

    & > ul {
      margin: 0;
      padding: 0;

      & > li {
        margin: 5px;

        @include flex-between-row;

        & > p,
        & > b {
          font-size: 8pt;
          font-family: Demi;
        }
        & > p {
          margin: 0;
          color: var(--text-color);

          &.pointer {
            cursor: pointer;
          }

          & > span {
            color: var(--muted-color);
          }
        }
        & > div {
          & > input {
            font-size: 8pt;
            text-align: right;
            padding: 0;
            height: 16px;
            width: 50px;
            border: none;
          }
        }
      }
    }
  }
</style>
