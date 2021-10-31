<script lang="ts">
</script>

<nav>
</nav>

<style type="text/scss">
  @import "../styles/mixins";
  nav {
    max-width: 900px;
    height: 60px;
    width: 100%;
    background-color: var(--card-color);
    z-index: 2;

    @media screen and (min-width: 899px) {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
  }
</style>
