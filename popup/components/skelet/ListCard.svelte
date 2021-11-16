<div class="wrapper">
  <div class="circle"/>
  <div class="warp">
    <div class="title"/>
    <div class="info"/>
  </div>
</div>

<style lang="scss">
	@import "../../styles/mixins";
  .wrapper {
    width: 100%;
    max-width: 290px;
    background-color: var(--card-color);
    padding: 5px;

    @include flex-between-row;
    @include border-radius(8px);
    @include loading-gradient(var(--background-color), var(--card-color));

    & > .circle {
      margin: 5px;
      padding: 20px;
      background-color: var(--background-color);

      @include border-radius(100%);
    }
    & > .warp {
      width: 100%;
      @include flex-column;

      & > .title {
        width: 50px;
        height: 20px;
        background-color: var(--background-color);
        margin-block-end: 10px;
        @include border-radius(4px);
      }
      & > .info {
        width: 70px;
        height: 10px;
        background-color: var(--background-color);
        @include border-radius(4px);
      }
    }
  }
</style>
