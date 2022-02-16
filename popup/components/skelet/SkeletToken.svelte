<span class="r"/>
<div class="column">
  <span class="s"/>
  <span class="l"/>
</div>
<span class="t"/>

<style lang="scss">
	@import "../../styles/mixins";

  span {
    &.r {
      height: 36px;
      width: 36px;
      background: var(--background-color);

      @include border-radius(100%);
    }
    &.t {
      width: 48px;
      height: 26px;
      background: var(--background-color);

      @include border-radius(2em);
    }
    &.s {
      height: 10px;
      width: 10%;
      background: var(--background-color);

      margin: 3px;

      @include border-radius(5px)
    }
    &.l {
      height: 13px;
      width: 50%;
      background: var(--background-color);

      margin: 3px;

      @include border-radius(5px)
    }
  }

  div.column {
    width: 66%;

    padding: 5px;

    padding-left: 16px;
    padding-right: 16px;

    @include flex-column;
  }
</style>
