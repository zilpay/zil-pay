<script lang="ts">
  import Arrow from './icons/Arrow.svelte';
  export let title = '';
  export let header = '';
  export let text = '';
</script>

<div class="card">
  <p>
    {title}
  </p>
  <div>
    <span>
      <slot />
    </span>
    <div>
      <h3>
        {header}
      </h3>
      <p>
        {text}
      </p>
    </div>
    <Arrow />
  </div>
</div>

<style lang="scss">
  @import "../styles/mixins";

  div.card {
    & > p {
      margin: 0;
    }
    & > div {
      cursor: pointer;
      padding-left: 15px;
      padding-right: 15px;
      min-width: 290px;
      @include flex-between-row;

      & > span {
        margin-right: 10px;
      }
      & > div {
        width: 100%;

        & > h3 {
          margin-block-end: 0;
        }
        & > p {
          font-size: 12px;
          margin-block-start: 0;
        }
      }
    }
  }
</style>
